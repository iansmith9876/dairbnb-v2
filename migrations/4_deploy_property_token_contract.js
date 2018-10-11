var PropertyToken = artifacts.require("./PropertyToken.sol");

module.exports = function(deployer) {
  deployer.deploy(PropertyToken);
};
