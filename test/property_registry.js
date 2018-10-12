const Property = artifacts.require("./Property.sol");
const PropertyRegistry = artifacts.require("./PropertyRegistry.sol");
const PropertyToken = artifacts.require("./PropertyToken.sol");

contract('PropertyRegistry Contract Tests', function(accounts) {

  let propertyRegistry;
  let property;
  let propertyToken;
  const alice = accounts[0], bob = accounts[1], eve = accounts[2];

  it('should be deployed, Property Registry', async () => {
    property = await Property.deployed();
    propertyToken = await PropertyToken.deployed();
    propertyRegistry = await PropertyRegistry.new(property.address, propertyToken.address);
    assert(propertyRegistry !== undefined, 'Property registry was NOT deployed');
    assert(property !== undefined, 'Property was NOT deployed');
    assert(propertyToken !== undefined, 'Property token was NOT deployed');
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
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.request(token, checkIn, checkOut, {from: bob})
    } catch(e) {
      assert(false);
    }
  });

  it('should not allow guest to request same property on overlapping dates', async () => {
    const checkIn = new Date(2018, 09, 10).getTime() / 1000;
    const checkOut = new Date(2018, 09, 18).getTime() / 1000;
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.request(token, checkIn, checkOut, {from: eve})
    } catch(e) {
      assert(true);
    }
  });

  it('should allow guest to request same property on different dates', async () => {
    const checkIn = new Date(2018, 09, 16).getTime() / 1000;
    const checkOut = new Date(2018, 09, 18).getTime() / 1000;
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.request(token, checkIn, checkOut, {from: eve})
    } catch(e) {
      assert(false);
    }
  });

  it('should allow owner to approve a guest', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.approveRequest(token, bob, {from: alice})
    } catch(e) {
      assert(false);
    }
  });

  it('should allow alice to mint Property Token for bob', async () => {
    const allocation = 500;
    const tx = await propertyToken.mint(bob, allocation);
    const balance = await propertyToken.balanceOf.call(bob);
    assert(balance.toNumber() === allocation, 'balance');
  });

  it('should allow guest to check in after approved', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyToken.approve(propertyRegistry.address, 100, { from: bob });
      await propertyRegistry.checkIn(token, {from: bob})
    } catch(e) {
      assert(false);
    }
  });

  it('should not allow another guest to check in to same property', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.checkIn(token, {from: eve})
      assert(false);
    } catch(e) {
      assert(true);
    }
  });

  it('should allow guest to check out', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.checkOut(token, {from: bob})
    assert(tx !== undefined, 'Guest was not able to check out');
  });

  it('should allow another guest to request same property once checked out', async () => {
    const checkIn = new Date(2018, 09, 10).getTime() / 1000;
    const checkOut = new Date(2018, 09, 15).getTime() / 1000;
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.request(token, checkIn, checkOut, {from: eve})
    assert(tx !== undefined, 'Another guest was not able to request the property');
  });

  it('should allow bob to approve the property registry to use his tokens', async () => {
    const tx = await propertyToken.approve(propertyRegistry.address, 100, { from: bob });
    assert(tx !== undefined, 'property registry has not been approved');
  });

});
