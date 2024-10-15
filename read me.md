/**
 * We have a number of domain name service providers for example 
 * 1. ENS = Ethereum name service this is to register .eth
 * 2. 3NS = Our company naming service - this is us and we want to deploy on a number of EVMs - this is to register .web3
 * 3. 3NSSub = Our comapny this is NON-CRYPTO to handle web2 subdomains for us
 * 4. BNS = Bitcoin Naming Service this is to register .btc
 * 5. FAR = Farcaster Naming Service (which is a fork of ENS) - registers .farcaster.id
 * 6. LENS = Lens Naming Service (which is a fork of ENS) - registers .lens.id
 *
 * For each naming service have a class which supports 4 methods
 * 
 * 1. checkAvailability - checks if it is availablex
 * 2. getPrice - gets the price of the domain name (we should also add gas price in here )
 * 3. purchaseDomain - purchases the domain name 
 * 4. transferDomain - transfers the domain name to a wallet 
 * 
 * So far we have implemented 2 classes for 
 *    ENS = ./ENSProvider.ts and 
 *    3NS = ./NS3Provider.ts (you cannot start a class with a number so we had to use NS3Provider)
 *          the forked ENS contracts have been deployed on Sepolia see the config in the ./NS3Provider.ts 
 *
 * 
 * The classes ./ENSProvider.ts and ./NS3Provider.ts work for checkAvailability and getPrice
 * However we need the following:
 * 1.) To test purchaseDomain and transferDomain for ENS and 3NS
 * 2.) To redeploy the contracts on Moonbeam and have a script so we can deploy on multiple other blockchains
 * 2a.) Use the folder "smart-contracts" to fork the ENS contracts and deploy and test against the 3NS provider the constructor takes the definition 
 *  
 * Ignore these functions they are for changing duration and other cart related things 
   
   addNameToDomainQuery
   addDomainQuery
   changeDomainQueryDuration
   getOneLatestDomainQueryForUser
   TESTchangeDomainQueryDuration

 * 
 */