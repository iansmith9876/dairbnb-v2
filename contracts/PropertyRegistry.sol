pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";

contract PropertyRegistry {

  ERC721Basic public property;

  address public owner;

  mapping(uint256 => Data) public stayData;

  struct Data {
    uint256 price;
    uint256 stays;
    address occupant;
    uint256 checkInDate;
    uint256 checkOutDate;
    bool approved;
    bool checkedIn;
  }


  constructor(address _property) public {
    property = ERC721Basic(_property);
  }
  modifier onlyOwner(uint256 _tokenId) {
    require(property.ownerOf(_tokenId) == msg.sender);
    _;
  }

  function registerProperty(uint256 _tokenId, uint256 _price) external onlyOwner(_tokenId) {
    stayData[_tokenId] = Data(_price, 0, address(0),0,0,false,false);
  }

  function request(uint256 _tokenId, uint256 _checkIn, uint256 _checkOut) external {
    require(stayData[_tokenId].checkInDate == 0);
    stayData[_tokenId].checkInDate = _checkIn;
    stayData[_tokenId].checkOutDate = _checkOut;
    stayData[_tokenId].approved = false;
    stayData[_tokenId].occupant = msg.sender;
  }

  function approveRequest(uint256 _tokenId) external onlyOwner(_tokenId) {
    stayData[_tokenId].approved = true;
  }

  function checkIn(uint256 _tokenId) external {
    require(msg.sender == stayData[_tokenId].occupant);
    require(now >= stayData[_tokenId].checkInDate);
    stayData[_tokenId].checkedIn = true;
  }

  function checkOut(uint256 _tokenId) external {
    require(msg.sender == stayData[_tokenId].occupant);
    stayData[_tokenId].checkedIn = false;
    stayData[_tokenId].checkInDate = 0;
    stayData[_tokenId].checkOutDate = 0;
    stayData[_tokenId].approved = false;
    stayData[_tokenId].occupant = 0;
  }

}
