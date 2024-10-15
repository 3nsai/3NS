import { exec as _exec } from 'child_process'

import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-solhint'
import '@nomiclabs/hardhat-truffle5'
import '@nomiclabs/hardhat-waffle'
import dotenv from 'dotenv'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import { HardhatUserConfig } from 'hardhat/config'
import { promisify } from 'util'
import '@nomicfoundation/hardhat-verify'

const exec = promisify(_exec)

// hardhat actions
import './tasks/accounts'
import './tasks/archive_scan'
import './tasks/save'
import './tasks/seed'

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
dotenv.config({ debug: false })

let real_accounts = undefined
if (process.env.DEPLOYER_KEY) {
  real_accounts = [
    process.env.DEPLOYER_KEY,
    process.env.OWNER_KEY || process.env.DEPLOYER_KEY,
  ]
}

// circular dependency shared with actions
export const archivedDeploymentPath = './deployments/archive'

const config = {
  networks: {
    hardhat: {
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
      allowUnlimitedContractSize: false,
      accounts: [
        {
          privateKey: process.env.DEPLOYER_KEY,
          balance: '10000000000000000000000', // Set initial balance for the account in wei
        },
      ],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 4,
      accounts: real_accounts,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 3,
      accounts: real_accounts,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 5,
      accounts: real_accounts,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 11155111,
      accounts: real_accounts,
      gasPrice: 5000000000,
    },
    bnbtest: {
      url: `https://bsc-testnet.blockpi.network/v1/rpc/public`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 97,
      accounts: real_accounts,
      gasPrice: 3000000000,
    },
    arbitrum_sepolia: {
      url: `https://sepolia-rollup.arbitrum.io/rpc`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 421614,
      accounts: real_accounts,
    },
    holesky: {
      url: `https://holesky-rpc.nocturnode.tech`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 17000,
      accounts: real_accounts,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['legacy', 'use_root'],
      chainId: 1,
      accounts: real_accounts,
    },
    moonbeam: {
      url: `https://rpc.api.moonbeam.network`,
      tags: ['legacy', 'use_root'],
      chainId: 1284,
      accounts: real_accounts,
      gasPrice: 150000000000,
      gas: 'auto',
    },
    moonbeamalpha: {
      url: `https://moonbase-alpha.public.blastapi.io`,
      tags: ['legacy', 'use_root'],
      chainId: 1287,
      accounts: real_accounts,
      gasPrice: 'auto',
      gas: 'auto',
    },
  },
  mocha: {},
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1200,
          },
        },
      },
      // for DummyOldResolver contract
      {
        version: '0.4.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  abiExporter: {
    path: './build/contracts',
    runOnCompile: true,
    clear: true,
    flat: true,
    except: [
      'Controllable$',
      'INameWrapper$',
      'SHA1$',
      'Ownable$',
      'NameResolver$',
      'TestBytesUtils$',
      'legacy/*',
    ],
    spacing: 2,
    pretty: true,
  },
  namedAccounts: {
    deployer: {
      default: `0x28D70415C2EF531b012FdBA23c25A421623Bc632`,
    },
    owner: '0x28D70415C2EF531b012FdBA23c25A421623Bc632', // Owner wallet address
  },
  external: {
    contracts: [
      {
        artifacts: [archivedDeploymentPath],
      },
    ],
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      moonbeam: 'AKQR5HRICT28KI87A7ZA151HD3B15J4P7V',
      arbitrumSepolia: 'XTFWXAPC9BIVTK29SNEY3MHU3G5CK9RU39',
      moonbaseAlpha: 'AKQR5HRICT28KI87A7ZA151HD3B15J4P7V'
    },
  },
  sourcify: {
    enabled: true,
  },
}

export default config
