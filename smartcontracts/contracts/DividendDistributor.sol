// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interface.sol";

contract DividendDistributor is IDividendDistributor, Ownable
{
    using SafeMath for uint256;

    address public tokenAddress;

    struct Share {
        uint256 amount;
        uint256 totalExcluded;// excluded dividend
        uint256 totalRealised;
    }

    address[] shareholders;
    mapping (address => uint256) shareholderIndexes;
    mapping (address => uint256) shareholderClaims;

    mapping (address => Share) public shares;

    uint256 public totalShares;
    uint256 public totalDividends;
    uint256 public totalDistributed;// to be shown in UI
    uint256 public dividendsPerShare;
    uint256 public dividendsPerShareAccuracyFactor;

    uint256 public minPeriod = 1 hours;
    uint256 public minDistribution;

    address public DEAD = 0x000000000000000000000000000000000000dEaD;
    address public ZERO = 0x0000000000000000000000000000000000000000;

    uint256 currentIndex;

    mapping (address => bool) public isDividendExempt;
    mapping (address => bool) private isReentrant;

    constructor(address _token) {
        dividendsPerShareAccuracyFactor = 10 ** 36;
        minPeriod = 1 hours;
        minDistribution = 5 * (10 ** 16);

        isDividendExempt[address(this)] = true;
        isDividendExempt[DEAD] = true;
        isDividendExempt[ZERO] = true;

        tokenAddress = _token;
    }

    modifier onlyToken() {
        require(msg.sender == tokenAddress, "only token contract can set shares");
        _;
    }

    function setTokenAddress(address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0));
        tokenAddress = _tokenAddress;
    }

    function setDistributionCriteria(uint256 _minPeriod, uint256 _minDistribution) external override onlyOwner {
        minPeriod = _minPeriod;
        minDistribution = _minDistribution;
    }

    function setShare(address shareholder, uint256 amount) external override onlyToken {
        if (isDividendExempt[shareholder] == true) return;

        if(shares[shareholder].amount > 0){
            distributeDividend(shareholder);
        }

        if(amount > 0 && shares[shareholder].amount == 0){
            addShareholder(shareholder);
        }else if(amount == 0 && shares[shareholder].amount > 0){
            removeShareholder(shareholder);
        }

        totalShares = totalShares.sub(shares[shareholder].amount).add(amount);
        shares[shareholder].amount = amount;
        shares[shareholder].totalExcluded = getCumulativeDividends(shares[shareholder].amount);
    }

    function deposit() external payable override onlyToken {
        uint256 amount = msg.value;

        totalDividends = totalDividends.add(amount);
        dividendsPerShare = dividendsPerShare.add(dividendsPerShareAccuracyFactor.mul(amount).div(totalShares));
    }

    function process(uint256 gas) external override onlyToken {
        uint256 shareholderCount = shareholders.length;

        if(shareholderCount == 0) { return; }

        uint256 gasUsed = 0;
        uint256 gasLeft = gasleft();

        uint256 iterations = 0;

        while(gasUsed < gas && iterations < shareholderCount) {
            if(currentIndex >= shareholderCount){
                currentIndex = 0;
            }

            if(shouldDistribute(shareholders[currentIndex])){
                distributeDividend(shareholders[currentIndex]);
            }

            gasUsed = gasUsed.add(gasLeft.sub(gasleft()));
            gasLeft = gasleft();
            currentIndex ++;
            iterations ++;
        }
    }

    function shouldDistribute(address shareholder) internal view returns (bool) {
        return shareholderClaims[shareholder] + minPeriod < block.timestamp
        && getUnpaidEarnings(shareholder) > minDistribution;
    }

    function distributeDividend(address shareholder) internal {
        if (isReentrant[shareholder] == true) { return; }

        if(shares[shareholder].amount == 0){ return; }

        isReentrant[shareholder] = true;

        uint256 amount = getUnpaidEarnings(shareholder);
        if(amount > 0){
            shareholderClaims[shareholder] = block.timestamp;
            shares[shareholder].totalRealised = shares[shareholder].totalRealised.add(amount);
            shares[shareholder].totalExcluded = getCumulativeDividends(shares[shareholder].amount);

            totalDistributed = totalDistributed.add(amount);

            (bool success, ) = payable(shareholder).call{
                value: amount,
                gas: 30000
            }("");

            require(success == true, "reward to the holder failed");
        }

        isReentrant[shareholder] = false;
    }

    function claimDividend() external {
        distributeDividend(msg.sender);
    }

    function getUnpaidEarnings(address shareholder) public view returns (uint256) {
        if(shares[shareholder].amount == 0){ return 0; }

        uint256 shareholderTotalDividends = getCumulativeDividends(shares[shareholder].amount);
        uint256 shareholderTotalExcluded = shares[shareholder].totalExcluded;

        if(shareholderTotalDividends <= shareholderTotalExcluded){ return 0; }

        return shareholderTotalDividends.sub(shareholderTotalExcluded);
    }

    function getCumulativeDividends(uint256 share) internal view returns (uint256) {
        return share.mul(dividendsPerShare).div(dividendsPerShareAccuracyFactor);
    }

    function addShareholder(address shareholder) internal {
        shareholderIndexes[shareholder] = shareholders.length;
        shareholders.push(shareholder);
    }

    function removeShareholder(address shareholder) internal {
        if (shareholders.length > 0 && shareholders[shareholderIndexes[shareholder]] == shareholder) {
            shareholders[shareholderIndexes[shareholder]] = shareholders[shareholders.length-1];
            shareholderIndexes[shareholders[shareholders.length-1]] = shareholderIndexes[shareholder];
            shareholders.pop();
        }
    }

    function _setExempt(address _addr, bool _set) internal {
        isDividendExempt[_addr] = _set;

        if (_set == true) {
            address shareholder = _addr;
            uint256 remainingUnpaid = getUnpaidEarnings(shareholder);

            if (remainingUnpaid > 0) {
                (bool success, ) = payable(_msgSender()).call{
                        value: remainingUnpaid,
                        gas: 30000
                    }("");
                require(success == true, "fee exempt pay error");
            }

            removeShareholder(shareholder);

            totalShares = totalShares.sub(shares[shareholder].amount);
            shares[shareholder].totalExcluded = getCumulativeDividends(shares[shareholder].amount);
            shares[shareholder].amount = 0;
        }
    }

    function setExempt(address[] calldata wallets, bool set) external payable onlyOwner {
        require(wallets.length > 0, "Invalid Parameters");
        uint256 i;
        for (i = 0; i < wallets.length; i ++) {
            _setExempt(wallets[i], set);
        }
    }

    function getRemainingTimeToBeRewarded(address shareHolder) external view returns (int256) {
        return int256(block.timestamp) - int256(shareholderClaims[shareHolder]);
    }

    function recoverETH(address to, uint256 amount) external payable onlyOwner {
        uint256 balance = address(this).balance;
        if (amount == 0) amount = balance;

        require(amount > 0, "No ETH to recover");

        (bool success,) = payable(to).call{value: amount}("");
        require(success, "Not Recovered ETH");
    }

    function recoverToken(address token, address to, uint256 amount) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (amount == 0) amount = balance;
        require(amount > 0, "No token to recover");

        IERC20(token).transfer(to, amount);
    }
}
