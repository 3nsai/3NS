import namehash from 'eth-ens-namehash'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { keccak256 } from 'js-sha3'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  console.log('here')

  if (!network.tags.use_root) {
    return true
  }

  const registry = await ethers.getContract('ENSRegistry')

  console.log("ENS Registry address using",registry.address);

  const deployArgs = {
    from: deployer,
    args: [registry.address, namehash.hash('web3')],
    log: true,
  }

  console.log('here2')
  const bri = await deploy('BaseRegistrarImplementation', deployArgs)
  console.log('here3')
  if (!bri.newlyDeployed) return

  if (network.name !== 'hardhat' && network.name !== 'localhost') {

    try {
      await hre.run("verify:verify", {
        address: bri.address,
        constructorArguments: deployArgs.args,
      });
      console.log("BaseRegistrarImplementation Contract verified successfully!");
    } catch (err) {
      console.log("BaseRegistrarImplementation Verification failed:", err);
    }
  
  }
}

func.id = 'registrar'
func.tags = ['ethregistrar', 'BaseRegistrarImplementation']
func.dependencies = ['registry', 'root']

export default func
