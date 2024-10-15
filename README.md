# Web3 Names Smart Contracts

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://bitbucket.org/livetree/web3nscfdomainqueries.git
```

### 2. Navigate to Smart Contracts Directory
```bash
cd smart-contracts
```

### 3. Install Dependencies
```bash
npm i -f
```

### 4. Configure Environment
Create a `.env` file in the smart-contracts directory with the following entries:
```
DEPLOYER_KEY=your_deployer_private_key
OWNER_KEY=your_owner_private_key
INFURA_API_KEY=your_infura_api_key
BATCH_GATEWAY_URLS=["https://ccip.ens.xyz"]
```

### 5. Update Hardhat Configuration
In `hardhat.config.ts`, replace the following section with your addresses:
```typescript
namedAccounts: {
  deployer: {
    default: `ADDRESS_ASSOCIATED_WITH_DEPLOYER_KEY`,
  },
  owner: 'ADDRESS_ASSOCIATED_WITH_OWNER_KEY',
}
```

### 6. Add Network API Keys
In `hardhat.config.ts`, add your API keys for smart contracts verification:
```typescript
etherscan: {
  apiKey: {
    moonbeam: 'YOUR_MOONBEAM_API_KEY',
    moonbaseAlpha: 'YOUR_MOONBASE_ALPHA_API_KEY'
  },
}
```

## Usage

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy Contracts

#### Local Deployment
```bash
npx hardhat node
```

#### Testnet/Mainnet Deployment
```bash
npx hardhat deploy --network <network_name>
```

Example:
```bash
npx hardhat deploy --network moonbeam
```

## Important Notes
- Ensure you replace all placeholder values in the `.env` file with your actual credentials
- Make sure you have sufficient funds in your wallet for deployments on target networks
- The owner key and deployer key should be the same

## Troubleshooting
If you encounter any issues during setup or deployment, please check:
- Node.js version is 18 or higher
- All environment variables are correctly set
- Your wallet has sufficient funds for the target network
