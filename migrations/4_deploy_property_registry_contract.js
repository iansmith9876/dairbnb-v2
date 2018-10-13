var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");
var Property = artifacts.require("./Property.sol");
var PropertyToken = artifacts.require("./PropertyToken.sol");

module.exports = function(deployer) {
  deployer.deploy(PropertyRegistry, Property.address, PropertyToken.address);
};
