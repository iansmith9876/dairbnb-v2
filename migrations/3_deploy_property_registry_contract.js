var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(PropertyRegistry, '0x345ca3e014aaf5dca488057592ee47305d9b3e10');
};
