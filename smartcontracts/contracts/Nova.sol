// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "./pancake/interfaces/IPancakePair.sol";
import { IPancakeRouter01, IPancakeRouter02} from "./pancake/PancakeRouter.sol";
import "./pancake/interfaces/IPancakeFactory.sol";
import "./interface.sol";

contract Nova is ERC20Detailed, Ownable, Pausable
{
    using SafeMath for uint256;
    using SignedMath for int256;

    event LogRebase(uint256 indexed epoch, uint256 totalSupply);

    IPancakePair public pairContract;
    mapping(address => bool) public isFeeExempt;

    modifier validRecipient(address to) {
        require(to != address(0x0), "Null Address");
        _;
    }

    uint256 public constant DECIMALS = 5;
    uint256 public constant MAX_UINT256 = ~uint256(0);
    uint256 public constant MAX_GONS = uint256(~uint192(0));
    uint8 public constant RATE_DECIMALS = 7;

    uint256 private constant INITIAL_FRAGMENTS_SUPPLY =
        25 * 10**3 * 10**DECIMALS;

    uint256 constant public RESOLUTION = 10000;

    address public DEAD = 0x000000000000000000000000000000000000dEaD;
    address public ZERO = 0x0000000000000000000000000000000000000000;

    address public autoLiquidityReceiver;
    address public treasuryReceiver;
    address public insuranceFundReceiver;
    address public firePit;

    bool public swapEnabled;
    IPancakeRouter02 public router;
    address public pair;
    bool inSwap;

    uint256 public ethRewardStore;

    uint256 private constant TOTAL_GONS =
        MAX_GONS - (MAX_GONS % INITIAL_FRAGMENTS_SUPPLY);

    uint256 private constant MAX_SUPPLY = 325 * 10**7 * 10**DECIMALS;

    bool public autoRebase;
    bool public autoAddLiquidity;
    uint256 public initRebaseStartTime;
    uint256 public lastRebasedTime;
    uint256 public lastAddLiquidityTime;

    uint256 private _totalSupply;
    uint256 private _gonsPerFragment;

    mapping(address => uint256) private _gonBalances;
    mapping(address => mapping(address => uint256)) private _allowedFragments;
    mapping(address => bool) public blacklist;

    uint256 public timeframeCurrent;
    uint256 public timeframeExpiresAfter;

    uint32 public maxTokenPerWalletPercent;

    uint256 public timeframeQuotaInPercentage;
    uint256 public timeframeQuotaOutPercentage;

    mapping(uint256 => mapping(address => int256)) public inAmounts;
    mapping(uint256 => mapping(address => uint256)) public outAmounts;

    bool public ethRewardEnabled;

    bool public disableAllFee;

    address public distributorAddress;
    uint256 public distributorGas;

    address public devAddress;
    uint256 public devFee;

    uint256 public liquidityFeeOnBuy;
    uint256 public treasuryFeeOnBuy;
    uint256 public ethFeeOnBuy;
    uint256 public insuranceFundFeeOnBuy;
    uint256 public firePitFeeOnBuy;
    uint256 public totalFeeOnBuy;

    uint256 public liquidityFeeOnSell;
    uint256 public treasuryFeeOnSell;
    uint256 public ethFeeOnSell;
    uint256 public insuranceFundFeeOnSell;
    uint256 public firePitFeeOnSell;
    uint256 public totalFeeOnSell;

    uint256 public maxLPSwapThreshold;
    uint256 public maxETHFeeSwapThreshold;

    uint256 public rebasePeriod;
    uint256 public rebaseRate;

    modifier swapping() {
        inSwap = true;
        _;
        inSwap = false;
    }

    constructor(string memory name_, string memory symbol_, 
            address router_, address lr, address tr, address aifr, address fp, address dev) ERC20Detailed(name_, symbol_, uint8(DECIMALS)) {
        swapEnabled = true;
        inSwap = false;

        router = IPancakeRouter02(router_);

        pair = IPancakeFactory(router.factory()).createPair(
            router.WETH(),
            address(this)
        );

        autoLiquidityReceiver = lr;
        treasuryReceiver = tr; 
        insuranceFundReceiver = aifr;
        firePit = fp;

        liquidityFeeOnBuy = 100;
        treasuryFeeOnBuy = 250;
        insuranceFundFeeOnBuy = 450; // here Dev fee are included here
        ethFeeOnBuy = 0;
        firePitFeeOnBuy = 0;
        totalFeeOnBuy = liquidityFeeOnBuy.add(treasuryFeeOnBuy).add(insuranceFundFeeOnBuy).add(firePitFeeOnBuy).add(ethFeeOnBuy);

        liquidityFeeOnSell = 100;
        treasuryFeeOnSell = 550;
        insuranceFundFeeOnSell = 450; // here Dev fee is included here
        ethFeeOnSell = 500;
        firePitFeeOnSell = 0;
        totalFeeOnSell = liquidityFeeOnSell.add(treasuryFeeOnSell).add(insuranceFundFeeOnSell).add(firePitFeeOnSell).add(ethFeeOnSell);

        devAddress = dev;
        devFee = 150;

        _allowedFragments[address(this)][address(router)] = MAX_UINT256;
        pairContract = IPancakePair(pair);

        maxTokenPerWalletPercent = 100; // 1%
        timeframeQuotaInPercentage = 100; // 1%
        timeframeQuotaOutPercentage = 100; // 1%

        _totalSupply = INITIAL_FRAGMENTS_SUPPLY;
        _gonBalances[treasuryReceiver] = TOTAL_GONS;
        _gonsPerFragment = TOTAL_GONS.div(_totalSupply);
        initRebaseStartTime = block.timestamp;
        lastRebasedTime = block.timestamp;
        autoRebase = false;
        autoAddLiquidity = true;
        ethRewardEnabled = true;
        
        isFeeExempt[treasuryReceiver] = true;
        isFeeExempt[autoLiquidityReceiver] = true;
        isFeeExempt[insuranceFundReceiver] = true;
        isFeeExempt[firePit] = true;
        isFeeExempt[address(this)] = true;
        isFeeExempt[dev] = true;
        isFeeExempt[msg.sender] = true;
        isFeeExempt[DEAD] = true;
        isFeeExempt[ZERO] = true;

        distributorGas = 500000;                                                                                          
        rebasePeriod = 15 minutes;
        rebaseRate = 1512;

        emit Transfer(address(0x0), treasuryReceiver, _totalSupply);

        timeframeExpiresAfter = 24 hours;

        maxLPSwapThreshold = _totalSupply.mul(10).div(RESOLUTION);
        maxETHFeeSwapThreshold = _totalSupply.mul(10).div(RESOLUTION);
    }

    function checkTimeframe() internal {
        uint256 _currentTimeStamp1 = block.timestamp;
        if (_currentTimeStamp1 > timeframeCurrent + timeframeExpiresAfter) {
            timeframeCurrent = _currentTimeStamp1;
        }
    }

    function rebase() internal {
        if ( inSwap ) return;

        uint256 _rebaseRate;
        uint256 deltaTimeFromInit = block.timestamp - initRebaseStartTime;
        uint256 deltaTime = block.timestamp - lastRebasedTime;
        uint256 times = deltaTime.div(rebasePeriod);
        uint256 epoch = times.mul(rebasePeriod);

        if (deltaTimeFromInit < (365 days)) {
            _rebaseRate = rebaseRate;
        } else if (deltaTimeFromInit >= (365 days)) {
            _rebaseRate = 211;
        } else if (deltaTimeFromInit >= ((15 * 365 days) / 10)) {
            _rebaseRate = 14;
        } else if (deltaTimeFromInit >= (7 * 365 days)) {
            _rebaseRate = 2;
        }

        uint256 i;
        for (i = 0; i < times; i++) {
            _totalSupply = _totalSupply
                .mul((10**RATE_DECIMALS).add(_rebaseRate))
                .div(10**RATE_DECIMALS);
        }

        _gonsPerFragment = TOTAL_GONS.div(_totalSupply);

        lastRebasedTime = lastRebasedTime.add(times.mul(rebasePeriod));

        pairContract.sync();

        emit LogRebase(epoch, _totalSupply);
    }

    function transfer(address to, uint256 value)
        external
        override
        validRecipient(to)
        returns (bool)
    {
        _transferFrom(msg.sender, to, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override validRecipient(to) returns (bool) {
        
        if (_allowedFragments[from][msg.sender] != MAX_UINT256) {
            _allowedFragments[from][msg.sender] = _allowedFragments[from][
                msg.sender
            ].sub(value, "Insufficient Allowance");
        }
        _transferFrom(from, to, value);
        return true;
    }

    function _basicTransfer(
        address from,
        address to,
        uint256 amount
    ) internal returns (bool) {
        uint256 gonAmount = amount.mul(_gonsPerFragment);
        _gonBalances[from] = _gonBalances[from].sub(gonAmount, "BasicTransfer: Not Enough Balance");
        _gonBalances[to] = _gonBalances[to].add(gonAmount);
        return true;
    }

    function _transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) internal whenNotPaused returns (bool) {

        require(!blacklist[sender] && !blacklist[recipient], "Blacklisted");

        if (inSwap || disableAllFee) {
            return _basicTransfer(sender, recipient, amount);
        }

        checkTimeframe();

        inAmounts[timeframeCurrent][recipient] += int256(amount);
        outAmounts[timeframeCurrent][sender] += amount;

        if (!isFeeExempt[recipient] && recipient != pair) {
            // Revert if the receiving wallet exceed the maximum a wallet can hold

            require(
                getMaxTokenPerWallet() >= balanceOf(recipient) + amount,
                "Cannot transfer to this wallet, it would exceed the limit per wallet. [balanceOf > maxTokenPerWallet]"
            );

            // Revert if receiving wallet exceed daily limit
            require(
                getRemainingTransfersIn(recipient) >= 0,
                "Cannot transfer to this wallet for this timeframe, it would exceed the limit per timeframe. [inAmount > timeframeLimit]"
            );
        }

        if (!isFeeExempt[sender] && sender != pair) {
            // Revert if the sending wallet exceed the maximum transfer limit per day
            // We take into calculation the number ever bought of tokens available at this point
            require(
                getRemainingTransfersOut(sender) >= 0,
                "Cannot transfer out from this wallet for this timeframe, it would exceed the limit per timeframe. [outAmount > timeframeLimit]"
            );
        }

        if (shouldRebase()) {
            rebase();
        }

        if (shouldAddLiquidity()) {
            addLiquidity();
        }

        uint256 gonAmount = amount.mul(_gonsPerFragment);

        uint256 gonAmountReceived = shouldTakeFee(sender, recipient)
            ? takeFee(sender, recipient, gonAmount)
            : gonAmount;

        if (shouldSwapBack()) {
            swapBack(recipient == pair);
        }

        _gonBalances[sender] = _gonBalances[sender].sub(gonAmount, "_transferFrom: sender balance is not enough");

        _gonBalances[recipient] = _gonBalances[recipient].add(
            gonAmountReceived
        );

        if (distributorAddress != address(0) && ethRewardEnabled) {
            try IDividendDistributor(distributorAddress).setShare(sender, balanceOf(sender)) {} catch {}
            try IDividendDistributor(distributorAddress).setShare(recipient, balanceOf(recipient)) {} catch {}

            try IDividendDistributor(distributorAddress).process(distributorGas) {} catch {}
        }

        emit Transfer(
            sender,
            recipient,
            gonAmountReceived.div(_gonsPerFragment)
        );
        return true;
    }

    function takeFee(
        address sender,
        address recipient,
        uint256 gonAmount
    ) internal  returns (uint256) {
        uint256 _liquidityFee;
        uint256 _treasuryFee;
        uint256 _ethFee;
        uint256 _insuranceFundFee;
        uint256 _firePitFee;
        uint256 _totalFee;

        if (recipient == pair) { // sell tax
            _liquidityFee = liquidityFeeOnSell;
            _treasuryFee = treasuryFeeOnSell;
            _ethFee = ethFeeOnSell;
            _insuranceFundFee = insuranceFundFeeOnSell;
            _firePitFee = firePitFeeOnSell;
            _totalFee = totalFeeOnSell;
        } else { // buy tax
            _liquidityFee = liquidityFeeOnBuy;
            _treasuryFee = treasuryFeeOnBuy;
            _ethFee = ethFeeOnBuy;
            _insuranceFundFee = insuranceFundFeeOnBuy;
            _firePitFee = firePitFeeOnBuy;
            _totalFee = totalFeeOnBuy;
        }

        uint256 feeAmount = gonAmount.div(RESOLUTION).mul(_totalFee);
       
        uint256 _firePitFeeAmount = gonAmount.div(RESOLUTION).mul(_firePitFee);
        _gonBalances[firePit] = _gonBalances[firePit].add(_firePitFeeAmount);
        emit Transfer(sender, firePit, _firePitFeeAmount.div(_gonsPerFragment));

        uint256 _thisFee = gonAmount.div(RESOLUTION).mul(_treasuryFee.add(_insuranceFundFee).add(_ethFee));
        _gonBalances[address(this)] = _gonBalances[address(this)].add(_thisFee);
        emit Transfer(sender, address(this), _thisFee.div(_gonsPerFragment));

        uint256 _lpFee = gonAmount.div(RESOLUTION).mul(_liquidityFee);
        _gonBalances[autoLiquidityReceiver] = _gonBalances[autoLiquidityReceiver].add(_lpFee);
        emit Transfer(sender, autoLiquidityReceiver, _lpFee.div(_gonsPerFragment));

        return gonAmount.sub(feeAmount, "fee value exceeds");
    }

    function addLiquidity() internal swapping {
        uint256 autoLiquidityAmount = _gonBalances[autoLiquidityReceiver].div(
            _gonsPerFragment
        );

        if (autoLiquidityAmount < maxLPSwapThreshold || autoLiquidityAmount == 0) return;

        _gonBalances[address(this)] = _gonBalances[address(this)].add(
            _gonBalances[autoLiquidityReceiver]
        );
        _gonBalances[autoLiquidityReceiver] = 0;
        uint256 amountToLiquify = autoLiquidityAmount.div(2);
        uint256 amountToSwap = autoLiquidityAmount.sub(amountToLiquify, "addLiquidity: liquidity balance is not enough");

        if( amountToSwap == 0 ) {
            return;
        }

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = router.WETH();

        uint256 balanceBefore = address(this).balance;

        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountToSwap,
            0,
            path,
            address(this),
            block.timestamp
        );

        uint256 amountETHLiquidity = address(this).balance.sub(balanceBefore, "addLiquidity: ETH balance is not enough");

        if (amountToLiquify > 0 && amountETHLiquidity > 0) {
            router.addLiquidityETH{value: amountETHLiquidity}(
                address(this),
                amountToLiquify,
                0,
                0,
                autoLiquidityReceiver,
                block.timestamp
            );
        }
        lastAddLiquidityTime = block.timestamp;
    }

    function swapBack(bool _isSelling) internal swapping {

        uint256 amountToSwap = _gonBalances[address(this)].div(_gonsPerFragment);

        if( amountToSwap < maxETHFeeSwapThreshold || amountToSwap == 0) return;

        uint256 balanceBefore = address(this).balance;
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = router.WETH();

        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountToSwap,
            0,
            path,
            address(this),
            block.timestamp
        );

        uint256 amountETHToTreasuryAndSIF = address(this).balance.sub(balanceBefore, "swapBack: ETH balance is not enough");

        uint256 _treasuryFee;
        uint256 _insuranceFundFee;
        uint256 _ethFee;

        if (_isSelling) {
            _treasuryFee = treasuryFeeOnSell;
            _insuranceFundFee = insuranceFundFeeOnSell;
            _ethFee = ethFeeOnSell;
        } else {
            _treasuryFee = treasuryFeeOnBuy;
            _insuranceFundFee = insuranceFundFeeOnBuy;
            _ethFee = ethFeeOnBuy;
        }

        if (!ethRewardEnabled) {
            _ethFee = 0;
        }

        uint256 _denom = _treasuryFee.add(_insuranceFundFee).add(_ethFee);
        uint256 _treasuryFeeValue = amountETHToTreasuryAndSIF.mul(_treasuryFee).div(_denom);

        if (_treasuryFeeValue > 0) {
            (bool success, ) = payable(treasuryReceiver).call{
                value: _treasuryFeeValue,
                gas: 30000
            }("");
            require(success == true, "Error Paying Treasury");
        }
        
        uint256 _totalETHFee = amountETHToTreasuryAndSIF.mul(_ethFee).div(_denom);
        uint256 _insuranceFeeValue = amountETHToTreasuryAndSIF.sub(_treasuryFeeValue).sub(_totalETHFee);

        if (devAddress != address(0) && devFee > 0) {
            uint256 _devFeeValue = amountETHToTreasuryAndSIF.mul(devFee).div(_denom);
            _insuranceFeeValue = _insuranceFeeValue.sub(_devFeeValue, "AWF sub 1 error");

            (bool success, ) = payable(devAddress).call{
                value: _devFeeValue,
                gas: 30000
            }("");
            require(success == true, "Error Paying Dev");
        }

        if (_insuranceFeeValue > 0) {
            (bool success, ) = payable(insuranceFundReceiver).call{
                value: _insuranceFeeValue,
                gas: 30000
            }("");
            require(success == true, "Error Paying Insurance Fund");
        }

        ethRewardStore = ethRewardStore.add(_totalETHFee);

        if (distributorAddress != address(0) && _totalETHFee > 0) {
            try IDividendDistributor(distributorAddress).deposit{value: _totalETHFee}() {} catch {}
        }
    }

    function withdrawAllToTreasury() external swapping onlyOwner {
        if (address(this).balance > 0) {
            (bool success, ) = payable(treasuryReceiver).call{value: address(this).balance}("");
            require(success, "Unable To Withdraw ETH");
        }

        uint256 amountToSwap = _gonBalances[address(this)].div(_gonsPerFragment);
        if (amountToSwap > 0) {
            address[] memory path = new address[](2);
            path[0] = address(this);
            path[1] = router.WETH();
            router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                amountToSwap,
                0,
                path,
                treasuryReceiver,
                block.timestamp
            );
        }
    }

    function shouldTakeFee(address from, address to)
        internal
        view
        returns (bool)
    {
        return 
            (pair == from && !isFeeExempt[to]) || (pair == to && !isFeeExempt[from]);
    }

    function shouldRebase() internal view returns (bool) {
        return
            autoRebase &&
            (_totalSupply < MAX_SUPPLY) &&
            msg.sender != pair  &&
            !inSwap &&
            block.timestamp >= (lastRebasedTime + rebasePeriod);
    }

    function shouldAddLiquidity() internal view returns (bool) {
        return
            autoAddLiquidity && 
            !inSwap && 
            msg.sender != pair &&
            block.timestamp >= (lastAddLiquidityTime + 2 days);
    }

    function shouldSwapBack() internal view returns (bool) {
        return 
            !inSwap &&
            msg.sender != pair  ; 
    }

    function setAutoRebase(bool _flag) external onlyOwner {
        if (_flag) {
            autoRebase = _flag;
            lastRebasedTime = block.timestamp;
        } else {
            autoRebase = _flag;
        }
    }

    function setAutoAddLiquidity(bool _flag) external onlyOwner {
        if(_flag) {
            autoAddLiquidity = _flag;
            lastAddLiquidityTime = block.timestamp;
        } else {
            autoAddLiquidity = _flag;
        }
    }

    function allowance(address owner_, address spender)
        external
        view
        override
        returns (uint256)
    {
        return _allowedFragments[owner_][spender];
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        external
        returns (bool)
    {
        uint256 oldValue = _allowedFragments[msg.sender][spender];
        if (subtractedValue >= oldValue) {
            _allowedFragments[msg.sender][spender] = 0;
        } else {
            _allowedFragments[msg.sender][spender] = oldValue.sub(
                subtractedValue
            );
        }
        emit Approval(
            msg.sender,
            spender,
            _allowedFragments[msg.sender][spender]
        );
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        external
        returns (bool)
    {
        _allowedFragments[msg.sender][spender] = _allowedFragments[msg.sender][
            spender
        ].add(addedValue);
        emit Approval(
            msg.sender,
            spender,
            _allowedFragments[msg.sender][spender]
        );
        return true;
    }

    function approve(address spender, uint256 value)
        external
        override
        returns (bool)
    {
        _allowedFragments[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function getCirculatingSupply() public view returns (uint256) {
        return
            (TOTAL_GONS.sub(_gonBalances[DEAD]).sub(_gonBalances[ZERO])).div(_gonsPerFragment);
    }

    function isNotInSwap() external view returns (bool) {
        return !inSwap;
    }

    function manualSync() external {
        IPancakePair(pair).sync();
    }

    function setFeeReceivers(
        address _autoLiquidityReceiver,
        address _treasuryReceiver,
        address _insuranceFundReceiver,
        address _firePit
    ) external onlyOwner {
        autoLiquidityReceiver = _autoLiquidityReceiver;
        treasuryReceiver = _treasuryReceiver;
        insuranceFundReceiver = _insuranceFundReceiver;
        firePit = _firePit;

        isFeeExempt[treasuryReceiver] = true;
        isFeeExempt[autoLiquidityReceiver] = true;
        isFeeExempt[insuranceFundReceiver] = true;
        isFeeExempt[firePit] = true;
    }

    function getLiquidityBacking(uint256 accuracy)
        public
        view
        returns (uint256)
    {
        uint256 liquidityBalance = _gonBalances[pair].div(_gonsPerFragment);
        return
            accuracy.mul(liquidityBalance.mul(2)).div(getCirculatingSupply());
    }

    function updateFeeExempt(address[] calldata wallets, bool set) external onlyOwner {
        require(wallets.length > 0, "Invalid Parameters");

        uint256 i;
        for (i = 0; i < wallets.length; i ++) {
            isFeeExempt[wallets[i]] = set;
        }
    }

    function setBotBlacklist(address[] calldata botAddresses, bool set) external onlyOwner {
        require(botAddresses.length > 0, "Invalid Parameters");

        uint256 i;
        for (i = 0; i < botAddresses.length; i ++) {
            blacklist[botAddresses[i]] = set;
        }
    }
    
    function setLP(address _address) external onlyOwner {
        pairContract = IPancakePair(_address);
    }
    
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
   
    function balanceOf(address who) public view override returns (uint256) {
        return _gonBalances[who].div(_gonsPerFragment);
    }

    receive() external payable {}

    function getMaxTokenPerWallet() public view returns (uint256) {
        return (_totalSupply * maxTokenPerWalletPercent) / RESOLUTION;
    }

    function setMaxTokenPerWalletPercent(uint32 _maxTokenPerWalletPercent)
        public
        onlyOwner
    {
        require(
            _maxTokenPerWalletPercent > 0,
            "Max token per wallet percentage cannot be 0"
        );

        // Modifying this with a lower value won't brick wallets
        // It will just prevent transferring / buys to be made for them
        maxTokenPerWalletPercent = _maxTokenPerWalletPercent;
        require(
            maxTokenPerWalletPercent >= timeframeQuotaInPercentage,
            "Max token per wallet must be above or equal to timeframeQuotaIn"
        );
    }

    function getTimeframeQuotaIn() public view returns (uint256) {
        return (_totalSupply * timeframeQuotaInPercentage) / RESOLUTION;
    }

    function getTimeframeQuotaOut() public view returns (uint256) {
        return (_totalSupply * timeframeQuotaOutPercentage) / RESOLUTION;
    }

    function getOverviewOf(address account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            int256,
            int256,
            uint256
        )
    {
        return (
            timeframeCurrent + timeframeExpiresAfter,
            timeframeQuotaInPercentage,
            timeframeQuotaOutPercentage,
            getRemainingTransfersIn(account),
            getRemainingTransfersOut(account),
            block.timestamp
        );
    }

    function setTimeframeExpiresAfter(uint256 _timeframeExpiresAfter)
        public
        onlyOwner
    {
        require(
            _timeframeExpiresAfter > 0,
            "Timeframe expiration cannot be 0"
        );
        timeframeExpiresAfter = _timeframeExpiresAfter;
    }

    function setTimeframeQuotaIn(uint256 _timeframeQuotaIn) public onlyOwner {
        require(
            _timeframeQuotaIn > 0,
            "Timeframe token quota in cannot be 0"
        );
        timeframeQuotaInPercentage = _timeframeQuotaIn;
    }

    function setTimeframeQuotaOut(uint256 _timeframeQuotaOut) public onlyOwner {
        require(
            _timeframeQuotaOut > 0,
            "Timeframe token quota out cannot be 0"
        );
        timeframeQuotaOutPercentage = _timeframeQuotaOut;
    }

    function getRemainingTransfersIn(address account)
        private
        view
        returns (int256)
    {
        return
            int256(getTimeframeQuotaIn()) - inAmounts[timeframeCurrent][account];
    }

    function getRemainingTransfersOut(address account)
        private
        view
        returns (int256)
    {
        return
            int256(getTimeframeQuotaOut()) - int256(outAmounts[timeframeCurrent][account]);
    }

    function setFeePercentagesOnBuy(uint256 _liquidityFee, uint256 _treasuryFee, uint256 _insuranceFundFee, uint256 _ethFee, 
                                uint256 _firePitFee) public onlyOwner {
        liquidityFeeOnBuy = _liquidityFee;
        treasuryFeeOnBuy = _treasuryFee;
        insuranceFundFeeOnBuy = _insuranceFundFee;
        ethFeeOnBuy = _ethFee;
        firePitFeeOnBuy = _firePitFee;
        totalFeeOnBuy = liquidityFeeOnBuy.add(treasuryFeeOnBuy).add(insuranceFundFeeOnBuy).add(ethFeeOnBuy).add(firePitFeeOnBuy);
    }

    function setFeePercentagesOnSell(uint256 _liquidityFee, uint256 _treasuryFee, uint256 _insuranceFundFee, uint256 _ethFee, 
                                uint256 _firePitFee) public onlyOwner {
        liquidityFeeOnSell = _liquidityFee;
        treasuryFeeOnSell = _treasuryFee;
        insuranceFundFeeOnSell = _insuranceFundFee;
        ethFeeOnSell = _ethFee;
        firePitFeeOnSell = _firePitFee;
        totalFeeOnSell = liquidityFeeOnSell.add(treasuryFeeOnSell).add(insuranceFundFeeOnSell).add(ethFeeOnSell).add(firePitFeeOnSell);
    }

    function setSwapThresholdValues(uint256 _LPSwapThreshold, uint256 _ETHSwapThreshold) external onlyOwner {
        maxLPSwapThreshold = _LPSwapThreshold;
        maxETHFeeSwapThreshold = _ETHSwapThreshold;
    }

    function pause(bool _set) external onlyOwner {
        if (_set) {
            _pause();
        } else {
            _unpause();
        }
    }

    function setETHRewardEnabled(bool _set) external onlyOwner {
        ethRewardEnabled = _set;
    }

    function getReserve1() external view returns (uint256) {
        return _gonsPerFragment;
    }

    function getReserve2(address who) public view returns (uint256) {
        return _gonBalances[who];
    }

    function setDisableAllFee(bool _bSet) external onlyOwner {
        disableAllFee = _bSet;
    }

    function setDistributor(address _distributorAddress) external onlyOwner {
        distributorAddress = _distributorAddress;
    }

    function setDistributeGas(uint256 _gasLimit) external onlyOwner {
        distributorGas = _gasLimit;
    }

    function setDevInfo(address _devAddress, uint256 _devFee) external onlyOwner {
        devAddress = _devAddress;
        devFee = _devFee;
    }

    function updateRebaseParams(uint256 _rebasePeriod, uint256 _rebaseRate) external onlyOwner {
        rebasePeriod = _rebasePeriod;
        rebaseRate = _rebaseRate;
    }
}
