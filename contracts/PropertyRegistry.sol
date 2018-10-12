pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract PropertyRegistry {

  ERC721Basic property;
  ERC20 propertyToken;

  address public owner;

  mapping(uint256 => Data) public stayData;

  struct Data {
    uint256 price;
    uint256 stays;
    address[] requested;
    address[] approved;
    address occupant;
    mapping(address => Request) requests;
  }

  struct Request {
    uint256 checkIn;
    uint256 checkOut;
  }

  modifier onlyOwner(uint256 _tokenId) {
    require(property.ownerOf(_tokenId) == msg.sender);
    _;
  }

  constructor(address _property, address _propertyToken) public {
    property = ERC721Basic(_property);
    propertyToken = ERC20(_propertyToken);
  }

  function registerProperty(uint256 _tokenId, uint256 _price) external onlyOwner(_tokenId) {
    stayData[_tokenId] = Data(_price, 0, new address[](0),new address[](0), address(0));
  }

  function request(uint256 _tokenId, uint256 _checkIn, uint256 _checkOut) external {
    uint arrayLength = stayData[_tokenId].requested.length;
    for (uint i=0; i<arrayLength; i++) {
      uint256 checkIn = stayData[_tokenId].requests[stayData[_tokenId].requested[i]].checkIn;
      uint256 checkOut = stayData[_tokenId].requests[stayData[_tokenId].requested[i]].checkOut;
      require(((_checkIn < checkIn) && (_checkOut < checkIn)) || ((_checkIn > checkOut) && (_checkOut > checkOut)));
    }

    stayData[_tokenId].requested.push(msg.sender);
    stayData[_tokenId].requests[msg.sender] = Request(_checkIn, _checkOut);
  }

  function approveRequest(uint256 _tokenId, address _guest) external onlyOwner(_tokenId) {
    stayData[_tokenId].approved.push(_guest);
  }

  function checkIn(uint256 _tokenId) external {
    uint arrayLength = stayData[_tokenId].approved.length;
    bool guestApproved = false;
    for (uint i=0; i<arrayLength; i++) {
      if (stayData[_tokenId].approved[i] == msg.sender) {
        guestApproved = now >= stayData[_tokenId].requests[msg.sender].checkIn;
        break;
      }
    }
    require(guestApproved);
    require(propertyToken.transferFrom(msg.sender, this, stayData[_tokenId].price));
    stayData[_tokenId].occupant = msg.sender;
    delete stayData[_tokenId].requests[msg.sender];
  }

  function checkOut(uint256 _tokenId) external {
    require(msg.sender == stayData[_tokenId].occupant);
    require(propertyToken.transfer(property.ownerOf(_tokenId), stayData[_tokenId].price));
    stayData[_tokenId].occupant = address(0);
    stayData[_tokenId].stays++;
  }

}
