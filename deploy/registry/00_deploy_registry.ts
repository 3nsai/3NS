import {  ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'


const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, run } = deployments
  const { deployer, owner } = await getNamedAccounts()


  if (network.name === 'hardhat' || network.name === 'localhost') {
    await network.provider.send('hardhat_setBalance', [
      owner,
      '0x100000000000000000000',
    ])
    await network.provider.send('hardhat_setBalance', [
      deployer,
      '0x100000000000000000000',
    ])
  }

  console.log('Named accounts ::', await getNamedAccounts())
  console.log('Network tags:', network.tags)
  console.log('Deployments:', deployments)

  
    const impl =   await deploy('ENSRegistry', {
      from: deployer,
      args: [],
      log: true,
    })


    const ENSRegistry = await ethers.getContractFactory("ENSRegistry");

    let proxyArgs = [impl.address, ENSRegistry.interface.encodeFunctionData('initialize',[])];

    const ethRegistryProxy =   await deploy('ERC1967Proxy', {
      from: deployer,
      args: proxyArgs,
      log: true,
    })

    await deployments.save('ENSRegistryImplementation', {
      address: impl.address,
      abi: (await deployments.getArtifact('ENSRegistry')).abi,
    });

    // Save the proxy address under the name 'ENSRegistry'
    await deployments.save('ENSRegistry', {
      address: ethRegistryProxy.address,
      abi: (await deployments.getArtifact('ENSRegistry')).abi,
    });

    console.log('ENSRegistry implementation deployed at:', impl.address);
    console.log('ENSRegistry proxy deployed at:', ethRegistryProxy.address);

      // Only run verification if the network is not 'hardhat' or 'localhost'

    if (network.name !== 'hardhat' && network.name !== 'localhost') {

      await delay(10000);


    try {
      await hre.run("verify:verify", {
        address: ethRegistryProxy.address,
        constructorArguments: proxyArgs,
        contract: '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy',
      });
      console.log("ENSRegistry Proxy Contract verified successfully!");
    } catch (err) {
      console.log("ENSRegistry Proxy Verification failed:", err);
    }


    try {
      await hre.run("verify:verify", {
        address: impl.address,
        constructorArguments: [],
      });
      console.log("ENSRegistryUpgradeable implementation Contract verified successfully!");
    } catch (err) {
      console.log("ENSRegistryUpgradeable implementation Verification failed:", err);
    }
  
  }
    // const ERC1967Proxy = await ethers.getContractFactory('ERC1967Proxy');

    // const proxy = await ERC1967Proxy.deploy(
    //   await impl.address,
    //   ENSRegistry.interface.encodeFunctionData('initialize',[]),
    // );
    // await proxy.deployed();

    // console.log(proxy.address);


  if (!network.tags.use_root) {
    const registry = await ethers.getContract('ENSRegistry')
    const rootOwner = await registry.owner(ZERO_HASH)
    switch (rootOwner) {
      case deployer:
        const tx = await registry.setOwner(ZERO_HASH, owner, { from: deployer })
        console.log(
          `Setting final owner of root node on registry (tx:${tx.hash})...`,
        )
        await tx.wait()
        break
      case owner:
        break
      default:
        console.log(
          `WARNING: ENS registry root is owned by ${rootOwner}; cannot transfer to owner`,
        )
    }
  }

  return true
}

// Delay function: pauses execution for the specified number of milliseconds
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


func.id = 'ens'
func.tags = ['registry', 'ENSRegistry']

export default func
