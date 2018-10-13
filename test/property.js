const Property = artifacts.require("./Property.sol");

contract('Property Contract Tests', function(accounts) {

  let property;
  const alice = accounts[0], bob = accounts[1];

  it('should be deployed, Property', async () => {
    property = await Property.deployed();
    assert(property !== undefined, 'Property was NOT deployed');
  });

  it('should allow alice to create a property', async () => {
    try {
      const tx = await property.createProperty({ from: alice });
      assert(true, 'Alice was able to create property');
    } catch(e) {
      assert(false, 'Alice was not able to create a property');
    }
  });

  it('should give alice a token', async () => {
    const aliceBalance = await property.balanceOf(alice);
    assert(aliceBalance == 1, "Account doesn't have proper token balance");
  });

  it('should give alice a unique token', async () => {
    const tx2 = await property.createProperty({ from: alice });
    const token1 = await property.tokenOfOwnerByIndex(alice, 0);
    const token2 = await property.tokenOfOwnerByIndex(alice, 1);
    assert(token1 == 1, "Account doesn't have proper token");
    assert(token1 != token2, "Tokens aren't unique");
  });

  it('should let alice set a token uri', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      const tx = await property.setURI(token, 'http://my.house.com', { from: alice });
      assert(true, 'Alice was able to set property uri');
    } catch(e) {
      assert(false, 'Alice was not able to set a property uri');
    }
  });

  it('should not let bob set a token uri for alice token', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      const tx = await property.setURI(token, 'http://my.house.com', { from: bob });
      assert(false, 'Bob was able to set property uri');
    } catch(e) {
      assert(true, 'Bob was not able to set a property uri');
    }
  });

  it('should return owned tokens', async () => {
    const properties = await property.getProperties({ from: alice });
    assert(properties.length == 2, 'Tokens were not returned');
  });
});
