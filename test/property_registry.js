const Property = artifacts.require("./Property.sol");
const PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

contract('PropertyRegistry Contract Tests', function(accounts) {

  let propertyRegistry;
  let property;
  const alice = accounts[0], bob = accounts[1];

  it('should be deployed, Property Registry', async () => {
    property = await Property.deployed();
    propertyRegistry = await PropertyRegistry.new(property.address);
    assert(propertyRegistry !== undefined, 'Property registry was NOT deployed');
    assert(property !== undefined, 'Property was NOT deployed');
  });

  it('should allow alice to register a property', async () => {
    await property.createProperty({ from: alice });
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.registerProperty(token, 100, {from: alice})
    } catch(e) {
      assert(false);
    }
  });

  it('should not allow bob to register alice property', async () => {
    await property.createProperty({ from: alice });
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.registerProperty(token, 100, {from: bob})
      assert(false);
    } catch(e) {
      assert(true);
    }
  });

});
