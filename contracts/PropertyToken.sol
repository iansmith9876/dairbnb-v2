pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract PropertyToken is DetailedERC20("PropertyToken", "PT", 18), MintableToken {}
