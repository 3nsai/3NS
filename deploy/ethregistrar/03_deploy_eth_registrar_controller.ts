import { Interface } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const { makeInterfaceId } = require('@openzeppelin/test-helpers')

function computeInterfaceId(iface: Interface) {
  return makeInterfaceId.ERC165(
    Object.values(iface.functions).map((frag) => frag.format('sighash')),
  )
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry', owner)

  const registrar = await ethers.getContract(
    'BaseRegistrarImplementation',
    owner,
  )
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar', owner)
  const nameWrapper = await ethers.getContract('NameWrapper', owner)
  const ethOwnedResolver = await ethers.getContract('OwnedResolver', owner)



  const impl =   await deploy('ETHRegistrarController', {
    from: deployer,
    args: [],
    log: true,
  })

  const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");

  const proxyInitializeArgs =  [
    registrar.address,
    reverseRegistrar.address,
    nameWrapper.address,
    registry.address,
  ];

  let proxyArgs = [impl.address, ETHRegistrarController.interface.encodeFunctionData('initialize',proxyInitializeArgs)];

  const ethRegistrarControllerProxy =   await deploy('ERC1967Proxy', {
    from: deployer,
    args: proxyArgs,
    log: true,
  })

  await deployments.save('ETHRegistrarControllerImplementation', {
    address: impl.address,
    abi: (await deployments.getArtifact('ETHRegistrarController')).abi,
  });

  // Save the proxy address under the name 'ETHRegistrarController'
  await deployments.save('ETHRegistrarController', {
    address: ethRegistrarControllerProxy.address,
    abi: (await deployments.getArtifact('ETHRegistrarController')).abi,
  });


  if (!impl.newlyDeployed) return

  console.log('ETHRegistrarController implementation deployed at:', impl.address);
  console.log('ETHRegistrarController proxy deployed at:', ethRegistrarControllerProxy.address);

  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    await delay(10000);

    try {
      await hre.run("verify:verify", {
        address: ethRegistrarControllerProxy.address,
        constructorArguments: proxyArgs,
        contract: '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy',
      });
      console.log("ETHRegistrarController Proxy Contract verified successfully!");
    } catch (err) {
      console.log("ETHRegistrarController Proxy Verification failed:", err);
    }


    try {
      await hre.run("verify:verify", {
        address: impl.address,
        constructorArguments: [],
      });
      console.log("ETHRegistrarController implementation Contract verified successfully!");
    } catch (err) {
      console.log("ETHRegistrarController implementation Verification failed:", err);
    }
  
  }

  if (owner !== deployer) {
    const c = await ethers.getContract('ETHRegistrarController', deployer)
    const tx = await c.transferOwnership(owner)
    console.log(
      `Transferring ownership of ETHRegistrarController to ${owner} (tx: ${tx.hash})...`,
    )
    await tx.wait()
  }

  // Only attempt to make controller etc changes directly on testnets
  if (network.name === 'mainnet') return

  console.log(
    'WRAPPER OWNER',
    await nameWrapper.owner(),
    await nameWrapper.signer.getAddress(),
  )
  const tx1 = await nameWrapper.setController(ethRegistrarControllerProxy.address, true)
  console.log(
    `Adding ETHRegistrarController as a controller of NameWrapper (tx: ${tx1.hash})...`,
  )
  await tx1.wait()

  const tx2 = await reverseRegistrar.setController(ethRegistrarControllerProxy.address, true)
  console.log(
    `Adding ETHRegistrarController as a controller of ReverseRegistrar (tx: ${tx2.hash})...`,
  )
  await tx2.wait()

  const artifact = await deployments.getArtifact('IETHRegistrarController')
  const interfaceId = computeInterfaceId(new Interface(artifact.abi))

  const resolver = await registry.resolver(ethers.utils.namehash('web3'))
  if (resolver === ethers.constants.AddressZero) {
    console.log(
      `No resolver set for .web3; not setting interface ${interfaceId} for ETH Registrar Controller`,
    )
    return
  }
  const resolverContract = await ethers.getContractAt('OwnedResolver', resolver)
  const tx3 = await resolverContract.setInterface(
    ethers.utils.namehash('web3'),
    interfaceId,
    ethRegistrarControllerProxy.address,
  )
  console.log(
    `Setting ETHRegistrarController interface ID ${interfaceId} on .web3 resolver (tx: ${tx3.hash})...`,
  )
  await tx3.wait()
}

// Delay function: pauses execution for the specified number of milliseconds
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


func.tags = ['ethregistrar', 'ETHRegistrarController']
func.dependencies = [
  'ENSRegistry',
  'BaseRegistrarImplementation',
  'ReverseRegistrar',
  'NameWrapper',
  'OwnedResolver',
]

export default func
