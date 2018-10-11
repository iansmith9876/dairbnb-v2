var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(PropertyRegistry, 0,0);
};
