import { ethers } from "hardhat";
const namehash = require("eth-ens-namehash");
const sha3 = require("web3-utils").sha3;
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";


async function main() {

  const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
  const BaseRegistrarImplementation = await ethers.getContractFactory("BaseRegistrarImplementation");
  const evmosPriceOracle = await ethers.getContractFactory("evmosPriceOracle");
  const PublicResolver = await ethers.getContractFactory("PublicResolver");
  const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
  const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");


  // deploy ENSregistry
  const ens = await ENSRegistry.deploy()

  const ensInstance = await ens.deployed()
  console.log("registry is deployed at " + `${ens.address}`)

  // deploy BaseRegistrarImplementation

  const BaseRegistrarImplementationInstance = await BaseRegistrarImplementation.deploy(ens.address,namehash.hash("light"))
  const BRI = await BaseRegistrarImplementationInstance.deployed()
  
  console.log("BaseRegistrarImplementation is deployed at " + `${BaseRegistrarImplementationInstance.address}`)

  const ll = await ethers.getSigners()
  
  //console.log(ll[0].address)
  // add controller to BaseRegistrarImplementation
  BRI.addController(ll[0].address) // not on mainnet comment the same

  // set subnode owner to ENSRegistry
  await ensInstance.setSubnodeOwner(ZERO_HASH, sha3("light"), BRI.address)
  


  const EvmosPOInstance = await evmosPriceOracle.deploy([0, 10, 100, 20, 10, 10, 10, 10])
  const PO = await EvmosPOInstance.deployed()
  console.log(PO.address + ` THIS IS PRICE ORACLE ADDRESS`)


  // deploy PublicResolver
  const PublicResolverInstance = await PublicResolver.deploy(ensInstance.address)
  const PResolver = await PublicResolverInstance.deployed()
  console.log(  `Public Resolver deployed at ${PResolver.address}`)

  // deploy ReverseRegistrar
  const ReverseRegistrarInstance = await ReverseRegistrar.deploy(ensInstance.address, PResolver.address)

  const RR = await ReverseRegistrarInstance.deployed()
  console.log(`ReverseRegistrarInstance deployed at ${RR.address}`)
  

  await ensInstance.setSubnodeOwner(ZERO_HASH, sha3('reverse'), ll[0].address, {
    from: ll[0].address,
  });

  await ensInstance.setSubnodeOwner(
    namehash.hash('reverse'),
    sha3('addr'),
    RR.address,
    { from: ll[0].address }
  );

  // deploy ETHRegistrarController
  const ETHRegistrarControllerInstance = await ETHRegistrarController.deploy(BRI.address,PO.address,60, 86400)

  const ERCI = await ETHRegistrarControllerInstance.deployed()
  console.log(`ETHRegistrarControllerInstanceAddress is ${ERCI.address}`)
  // add controller to ENSRegistry
  await BRI.addController(ERCI.address);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
