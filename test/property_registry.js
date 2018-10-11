const Property = artifacts.require("./Property.sol");
const PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

contract('PropertyRegistry Contract Tests', function(accounts) {

  let propertyRegistry;
  let property;
  const alice = accounts[0], bob = accounts[1], eve = accounts[2];

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

  it('should allow guest to request dates', async () => {
    const checkIn = new Date(2018, 09, 1).getTime() / 1000;
    const checkOut = new Date(2018, 09, 15).getTime() / 1000;
    try {
      await propertyRegistry.request(1, checkIn, checkOut, {from: bob})
      assert(true);
    } catch(e) {
      assert(false);
    }
  });

  it('should not allow guest to request same property', async () => {
    const checkIn = new Date(2018, 09, 10).getTime() / 1000;
    const checkOut = new Date(2018, 09, 15).getTime() / 1000;
    try {
      await propertyRegistry.request(1, checkIn, checkOut, {from: eve})
      assert(false);
    } catch(e) {
      assert(true);
    }
  });

  it('should allow owner to approve a guest', async () => {
    try {
      await propertyRegistry.approveRequest(1, {from: alice})
    } catch(e) {
      assert(false);
    }
  });

  it('should allow guest to check in after approved', async () => {
    try {
      await propertyRegistry.checkIn(1, {from: bob})
    } catch(e) {
      assert(false);
    }
  });

  it('should not allow another guest to check in to same property', async () => {
    try {
      await propertyRegistry.checkIn(1, {from: eve})
      assert(false);
    } catch(e) {
      assert(true);
    }
  });

  it('should allow guest to check out', async () => {
    try {
      await propertyRegistry.checkOut(1, {from: bob})
    } catch(e) {
      assert(false);
    }
  });

  it('should allow another guest to request same property once checked out', async () => {
    const checkIn = new Date(2018, 09, 10).getTime() / 1000;
    const checkOut = new Date(2018, 09, 15).getTime() / 1000;
    try {
      await propertyRegistry.request(1, checkIn, checkOut, {from: eve})
    } catch(e) {
      assert(false);
    }
  });

});
