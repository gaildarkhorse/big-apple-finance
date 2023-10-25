const walletConfig =
{
    // 1: {
    //     chainId: '0x1',
    //     switchLabel: 'Click here to use BSC Chain',
    //     networkName: 'Ethereum Mainnet',
    //     logo: '/img/ethereum.png',
    //     mainnet: true,
    //     network: "ethereum",
    //     nativeCurrency: {
    //         name: 'ETH',
    //         symbol: 'ETH',
    //         decimals: 18
    //     },
    //     rpcUrls: ['https://mainnet.infura.io/v3/7535811d19b1410e98c261fbb638651a'],
    //     blockUrls: ['https://etherscan.io/'],
    //     apiUrl: 'https://api.etherscan.io/api',
    //     apiKey: '6261JHGXK1E5GG3R9BBVD99VSD86F8FG2B'
    // },
    // 97: {
    //     chainId: '0x61',
    //     switchLabel: 'Click here to use ETH Chain',
    //     networkName: 'Binance Smart Chain Testnet',
    //     network: "bsctestnet",
    //     logo: '/img/binance.png',
    //     mainnet: true,
    //     nativeCurrency: {
    //         name: 'BNB',
    //         symbol: 'BNB',
    //         decimals: 18
    //     },
    //     rpcUrls: ['https://data-seed-prebsc-1-s3.binance.org:8545/'],
    //     // rpcUrls: ['https://speedy-nodes-nyc.moralis.io/129fb60c557f500721cfea1f/bsc/mainnet'],
    //     blockUrls: ['https://testnet.bscscan.com/'],
    //     apiUrl: 'https://testnet.bscscan.com/api',
    //     apiKey: 'IG31YYT5I9R86PAHH3Y7XXTSHUQHS6GYTC'
    // },
    42161: {
        chainId: '0xA4B1',
        switchLabel: '',
        networkName: 'Arbitrum One',
        network: "arbitrum",
        logo: '/img/arbitrum.png',
        mainnet: true,
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://rpc.ankr.com/arbitrum', 'https://endpoints.omniatech.io/v1/arbitrum/one/public', 'https://arb1.arbitrum.io/rpc'],
        blockUrls: ['https://arbiscan.io/'],
    },
}

export default walletConfig
