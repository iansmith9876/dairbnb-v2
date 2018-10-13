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
    assert(propertyRegistry !== undefined, 'Property registry was NOT deployed.');
    assert(property !== undefined, 'Property was NOT deployed.');
    assert(propertyToken !== undefined, 'Property token was NOT deployed.');
  });

  it('should allow owner to register a property', async () => {
    await property.createProperty({ from: alice });
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.registerProperty(token, 100, {from: alice});
    assert(tx !== undefined, "Owner was not able to register a property.");
  });

  it('should not allow non owner to register owners property', async () => {
    await property.createProperty({ from: alice });
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.registerProperty(token, 100, {from: bob})
      assert(false, "Non owner registered the property when they shouldn't be able to.");
    } catch(e) {
      assert(true, "Non owner was not able to register property.");
    }
  });

  it('should allow guest to request dates', async () => {
    const checkIn = new Date(2018, 09, 1).getTime() / 1000;
    const checkOut = new Date(2018, 09, 15).getTime() / 1000;
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.request(token, checkIn, checkOut, {from: bob})
    assert(tx !== undefined, "Guest was unable to request dates.");
  });

  it('should not allow guest to request same property on overlapping dates', async () => {
    const checkIn = new Date(2018, 09, 10).getTime() / 1000;
    const checkOut = new Date(2018, 09, 18).getTime() / 1000;
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.request(token, checkIn, checkOut, {from: eve})
      assert(false, "Guest requested same property on overlapping dates.");
    } catch(e) {
      assert(true, "Guest was unable to request same property on overlapping dates.");
    }
  });

  it('should allow guest to request same property on different dates', async () => {
    const checkIn = new Date(2018, 09, 16).getTime() / 1000;
    const checkOut = new Date(2018, 09, 18).getTime() / 1000;
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.request(token, checkIn, checkOut, {from: eve});
    assert(tx !== undefined, "Guest was not allowed to request same property on different dates.");
  });

  it('should allow owner to approve a guest', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.approveRequest(token, bob, {from: alice})
    assert(tx !== undefined, "Owner was not able to approve guest.");
  });

  it('should allow alice to mint Property Token for bob', async () => {
    const allocation = 500;
    const tx = await propertyToken.mint(bob, allocation);
    const balance = await propertyToken.balanceOf.call(bob);
    assert(balance.toNumber() === allocation, 'Incorrect balance.');
  });

  it('should allow guest to check in after approved', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    await propertyToken.approve(propertyRegistry.address, 100, { from: bob });
    const tx = await propertyRegistry.checkIn(token, {from: bob})
    assert(tx !== undefined, "Guest was not able to checkin after approved.");
  });

  it('should not allow another guest to check in to same property', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    try {
      await propertyRegistry.checkIn(token, {from: eve})
      assert(false, "Eve was allowed to check in at the same time.");
    } catch(e) {
      assert(true, "Eve couldn't check in at the same time.");
    }
  });

  it('should allow guest to check out', async () => {
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.checkOut(token, {from: bob})
    assert(tx !== undefined, 'Guest was not able to check out.');
  });

  it('should allow another guest to request same property once checked out', async () => {
    const checkIn = new Date(2018, 09, 10).getTime() / 1000;
    const checkOut = new Date(2018, 09, 15).getTime() / 1000;
    const token = await property.tokenOfOwnerByIndex(alice, 0);
    const tx = await propertyRegistry.request(token, checkIn, checkOut, {from: eve})
    assert(tx !== undefined, 'Another guest was not able to request the property.');
  });

  it('should allow bob to approve the property registry to use his tokens', async () => {
    const tx = await propertyToken.approve(propertyRegistry.address, 100, { from: bob });
    assert(tx !== undefined, 'property registry has not been approved.');
  });

});
