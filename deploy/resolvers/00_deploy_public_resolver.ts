import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry', owner)
  const nameWrapper = await ethers.getContract('NameWrapper', owner)
  const controller = await ethers.getContract('ETHRegistrarController', owner)
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar', owner)



  const impl =   await deploy('PublicResolver', {
    from: deployer,
    args: [],
    log: true,
  })

  const PublicResolver = await ethers.getContractFactory("PublicResolver");

  const proxyInitializeArgs = [
    registry.address,
    nameWrapper.address,
    controller.address,
    reverseRegistrar.address,
]

let proxyArgs = [impl.address, PublicResolver.interface.encodeFunctionData('initialize',proxyInitializeArgs)];

const publicResolverProxy =   await deploy('ERC1967Proxy', {
  from: deployer,
  args: proxyArgs,
  log: true,
})

await deployments.save('PublicResolverImplementation', {
  address: impl.address,
  abi: (await deployments.getArtifact('PublicResolver')).abi,
});

// Save the proxy address under the name 'PublicResolver'
await deployments.save('PublicResolver', {
  address: publicResolverProxy.address,
  abi: (await deployments.getArtifact('PublicResolver')).abi,
});

  if (!publicResolverProxy.newlyDeployed) return

  console.log('PublicResolver implementation deployed at:', impl.address);
  console.log('PublicResolver proxy deployed at:', publicResolverProxy.address);

  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    await delay(10000);

    try {
      await hre.run("verify:verify", {
        address: publicResolverProxy.address,
        constructorArguments: proxyArgs,
        contract: '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy',
      });
      console.log("PublicResolver Proxy Contract verified successfully!");
    } catch (err) {
      console.log("PublicResolver Proxy Verification failed:", err);
    }


    try {
      await hre.run("verify:verify", {
        address: impl.address,
        constructorArguments: [],
      });
      console.log("PublicResolver implementation Contract verified successfully!");
    } catch (err) {
      console.log("PublicResolver implementation Verification failed:", err);
    }
  
  }


  const tx = await reverseRegistrar.setDefaultResolver(publicResolverProxy.address)
  console.log(
    `Setting default resolver on ReverseRegistrar to PublicResolver (tx: ${tx.hash})...`,
  )
  await tx.wait()

  const _owner = await registry.owner(ethers.utils.namehash('resolver.web3'))
  console.log('resolver.web3 owner: ', _owner)
  if (_owner === owner) {
    const pr = (await ethers.getContract('PublicResolver')).connect(
      await ethers.getSigner(owner),
    )
    const resolverHash = ethers.utils.namehash('resolver.web3')
    const tx2 = await registry.setResolver(resolverHash, pr.address)
    console.log(
      `Setting resolver for resolver.web3 to PublicResolver (tx: ${tx2.hash})...`,
    )
    await tx2.wait()

    const tx3 = await pr['setAddr(bytes32,address)'](resolverHash, pr.address)
    console.log(
      `Setting address for resolver.web3 to PublicResolver (tx: ${tx3.hash})...`,
    )
    await tx3.wait()
  } else {
    console.log(
      'resolver.web3 is not owned by the owner address, not setting resolver',
    )
  }
}

// Delay function: pauses execution for the specified number of milliseconds
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


func.id = 'resolver'
func.tags = ['resolvers', 'PublicResolver']
func.dependencies = [
  'registry',
  'ETHRegistrarController',
  'NameWrapper',
  'ReverseRegistrar',
]

export default func
