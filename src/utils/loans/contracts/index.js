import funds from './abi/funds.json'
import loans from './abi/loans.json'
import sales from './abi/sales.json'
import erc20 from './abi/erc20.json'
import ctoken from './abi/ctoken.json'
import chainlink from './abi/chainlink.json'
import oraclize from './abi/oraclize.json'
import medianizer from './abi/medianizer.json'

const contractAddresses = {
  mainnet: {
    DAI: {
      TokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
      CTokenAddress: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      FundAddress: '0x7791cF9a85072698e9B805eb8156EC1e9c3fc724',
      LoanAddress: '0xa25Ad02862756680Ee8aE7aa9ccC37D3d3F75A4C',
      SaleAddress: '0x3171781bcfCd9E111225CDB42f33E856BA9F7A5a'
    },
    USDC: {
      TokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      CTokenAddress: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      FundAddress: '0x3528C164e3fCA20E2333Cf58Ab4B1c99DeF83347',
      LoanAddress: '0x20233a2095787DAC434F20f8954d3758986EF30E',
      SaleAddress: '0xf30Cb0Ae1879b18dEb48932A8a6F362e5789EE01'
    },
    weth: {
      TokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    },
    link: {
      TokenAddress: '0x514910771af9ca656af840dff83e8264ecf986ca'
    },
    oracles: {
      Medianizer: '0xBC32048D9Be3A3c3b626c44D296CEfaaA400c797',
      ChainLink: {
        BlockchainInfo: '0x9745936F56296f557B089F77ccb55d582A1a37ee',
        BitBay: '0x374C757Cd5a086a808726eC69219488E18277f01',
        CoinMarketCap: '0xB97C1DaA7e90c3E0da87E1e32C2DAdA2D9D2302c',
        CryptoCompare: '0xDd01810cCE40cE12e863d3ac58C0dCE0663A77ca',
        Gemini: '0xd6C82d030EFFc434E14E16205E21eC7755240dD7'
      },
      Oraclize: {
        Bitstamp: '0xC23A6ee100a04C3468131B6a6d97F7803E5AbB6E',
        Coinbase: '0xADb961aF5eEb0aE843A7111615BA8795bA27417F',
        CryptoWatch: '0x6FEd768f081cACF1543684c0a379AE95CFf6eb95',
        Coinpaprika: '0x285b2Af01B71074bCebb4042fa1CEE21D2F60873',
        Kraken: '0x17D0CA1CDc46be5b4dC9219FE476cA35a67370C7'
      }
    }
  },
  testnet: {
    DAI: {
      TokenAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
      CTokenAddress: '0xe7bc397dbd069fc7d0109c0636d06888bb50668c',
      FundAddress: '0x40F29b63bCf98fddd0484a94f0b3F66B26ff3dc3',
      LoanAddress: '0x364FAB1544dBE6fF2F34E6F59D96E864BcEEc2b8',
      SaleAddress: '0x0f0Ef538C8941D0F448F7051E93c7dc502ad3CB7'
    },
    USDC: {
      TokenAddress: '0x75b0622cec14130172eae9cf166b92e5c112faff',
      CTokenAddress: '0xcfc9bb230f00bffdb560fce2428b4e05f3442e35',
      FundAddress: '0xD8ee4901ab3dBA766271aB1bDeF221d914819F18',
      LoanAddress: '0x986c48e5BCadBB01C2c143cd49e9d1B301aF48ba',
      SaleAddress: '0x01A3E0a89Ef7bd759d7037b733f030efe240E765'
    },
    weth: {
      TokenAddress: '0xe5675177215fB68DdA92b0678b1646d9FC612D0E'
    },
    link: {
      TokenAddress: '0xa36085F69e2889c224210F603D836748e7dC0088'
    },
    oracles: {
      Medianizer: '0x8b262e17C7D1C210FC9B6D8B26498F0f4f530776',
      ChainLink: {
        BlockchainInfo: '0x92B954ac1C762d6537622451282aaeeE64a7BBbC',
        BitBay: '0xF25663fE5C990837113da4fad3Bb421FA0ce15cD',
        CoinMarketCap: '0xbF0F857fe7eCABFba72CB19c918E6e4b555c6461',
        CryptoCompare: '0x2c2a57B470c48620051a623f0A393DA7A054E53e',
        Gemini: '0x8FEAc2189bb5Cac5D81842f2c459E4069C62C90D'
      },
      Oraclize: {
        Bitstamp: '0x6b6Bd28297e6c18A44b0AF951da139019c3C879B',
        Coinbase: '0x62Fae132B9ffd19Fb69B3475428F9C5912A4C0ba',
        CryptoWatch: '0xBf595bbDFCA8ad93810e2824Bf13f160f6eE72e8',
        Coinpaprika: '0xFa09c4CD65bD5Bb140924EC2eeD038C087Bc3c3D',
        Kraken: '0x86AB5287F523b8E03a61AcD105E1957E17B6900D'
      }
    }
  }
}

const schema = {}
const contracts = {}

schema.funds = {
  abi: funds,
  configName: 'FundAddress'
}

schema.loans = {
  abi: loans,
  configName: 'LoanAddress'
}

schema.sales = {
  abi: sales,
  configName: 'SaleAddress'
}

schema.erc20 = {
  abi: erc20,
  configName: 'TokenAddress'
}

schema.ctoken = {
  abi: ctoken,
  configName: 'CTokenAddress'
}

schema.medianizer = {
  abi: medianizer,
  configName: 'Medianizer'
}

schema.chainlink = {
  abi: chainlink,
  configName: 'ChainLink'
}

schema.oraclize = {
  abi: oraclize,
  configName: 'Oraclize'
}

export async function getContract (client, network, principal, type) {
  if (contracts[principal] && contracts[principal][type]) return contracts[principal][type]

  const web3 = client.web3
  if (!web3) return console.error('web3 not found')
  if (!contracts[principal]) contracts[principal] = {}

  contracts[principal][type] = new web3.eth.Contract(
    schema[type].abi.abi,
    contractAddresses[network][principal][schema[type].configName]
  )

  return contracts[principal][type]
}
