// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Test.sol";
import { Pool } from "../src/Pool.sol";


contract PoolTest is Test {
  address owner = makeAddr("User0");
  address addr1 = makeAddr("User1");
  address addr2 = makeAddr("User2");
  address addr3 = makeAddr("User3");

  uint256 duration = 4 weeks; //timestamp 4*7*24*60*60
  uint256 goal = 10 ether;

  Pool pool; // contract under test, varible named pool

  function setUp() public {
    vm.prank(owner);
    pool = new Pool(duration, goal);
  }

  function test_ContractDeploySuccessfully() view public {
    address _owner = pool.owner();
    assertEq(owner, _owner);
    uint256 _end = pool.end();
    assertEq(block.timestamp + duration, _end);
    uint256 _goal = pool.goal();
    assertEq(goal, _goal);
  }

  // Contribute when the pool is finished
  function test_RevertWhen_EndIsReached() public {
    vm.warp(pool.end() + 3600);

    bytes4 selector = bytes4(keccak256("CollectIsFinished()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    vm.prank(addr1);
    vm.deal(addr1, 1 ether);
    pool.contribute{value: 1 ether}();
  }

  // Contribute when not enough funds
  function test_RevertWhen_NotEnoughFunds() public {
    bytes4 selector = bytes4(keccak256("NotEnoughFunds()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    vm.prank(addr1);
    pool.contribute();
  }

  // Contribute successfully
  function test_ExpectEmit_SuccessfullContribute(uint96 _amount) public {
    vm.assume(_amount > 0);
    vm.expectEmit(true, false, false, true);
    emit Pool.Contribute(address(addr1), _amount);

    vm.prank(addr1);
    vm.deal(addr1, _amount);
    pool.contribute{value: _amount}();
  }

  // Withdraw when not the owner
  function test_RevertWhen_NotTheOwner() public {
    bytes4 selector = bytes4(keccak256("OwnableUnauthorizedAccount(address)"));
    vm.expectRevert(abi.encodeWithSelector(selector, addr1));

    vm.prank(addr1);
    pool.withdraw();
  }

  // Withdraw when the pool is not finished
  function test_RevertWhen_EndIsNotReached() public {
    bytes4 selector = bytes4(keccak256("CollectNotFinished()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    vm.prank(owner);
    pool.withdraw();
  }

  // Withdraw when the goal is not reached
  function test_RevertWhen_GoalIsNotReached() public {
    vm.prank(addr1);
    vm.deal(addr1, 5 ether);
    pool.contribute{value: 5 ether}();

    vm.warp(pool.end() + 3600);

    bytes4 selector = bytes4(keccak256("CollectNotFinished()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    vm.prank(owner);
    pool.withdraw();
  }

  // Withdraw when failed to send ether
  function test_RevertWhen_FailedToSendEther() public {
    pool = new Pool(duration, goal);

    vm.prank(addr1);
    vm.deal(addr1, 6 ether);
    pool.contribute{value: 6 ether}();

    vm.prank(addr2);
    vm.deal(addr2, 5 ether);
    pool.contribute{value: 5 ether}();

    vm.warp(pool.end() + 3600);

    bytes4 selector = bytes4(keccak256("FailedToSendEther()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    pool.withdraw();
  }

  // Withdraw successfully
  function test_ExpectEmit_SuccessfullWithdraw() public {

    vm.prank(addr1);
    vm.deal(addr1, 6 ether);
    pool.contribute{value: 6 ether}();

    vm.prank(addr2);
    vm.deal(addr2, 5 ether);
    pool.contribute{value: 5 ether}();

    vm.warp(pool.end() + 3600);

    vm.prank(owner);
    pool.withdraw();
  }

  // Refund when the pool is not finished
  function test_RevertWhen_CollectNotFinished() public{
    vm.prank(addr1);
    vm.deal(addr1, 6 ether);
    pool.contribute{value: 6 ether}();

    vm.prank(addr2);
    vm.deal(addr2, 5 ether);
    pool.contribute{value: 5 ether}();

    bytes4 selector = bytes4(keccak256("CollectNotFinished()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    vm.prank(addr1);
    pool.refund();
  }

  // Refund when the goal is reached
  function test_RevertWhen_GoalAlreadyReached() public {
    vm.prank(addr1);
    vm.deal(addr1, 6 ether);
    pool.contribute{value: 6 ether}();

    vm.prank(addr2);
    vm.deal(addr2, 5 ether);
    pool.contribute{value: 5 ether}();

    vm.warp(pool.end() + 3600);

    bytes4 selector = bytes4(keccak256("GoalAlreadyReached()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    vm.prank(addr1);
    pool.refund();
  }

  // Refund when no contribution
  function test_RevertWhen_NoContribution() public {
    vm.prank(addr1);
    vm.deal(addr1, 6 ether);
    pool.contribute{value: 6 ether}();

    vm.prank(addr2);
    vm.deal(addr2, 1 ether);
    pool.contribute{value: 1 ether}();
    vm.warp(pool.end() + 3600);

    bytes4 selector = bytes4(keccak256("NoContribution()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    vm.prank(addr3);
    pool.refund();
  }

  // Refund when failed to send ether, address(this) is the contract address
  function test_RevertWhen_RefundFailedToSendEther()  public {
    vm.deal(address(this), 2 ether);
    pool.contribute{value: 2 ether}();

    vm.prank(addr1);
    vm.deal(addr1, 6 ether);
    pool.contribute{value: 6 ether}();

    vm.warp(pool.end() + 3600);


    bytes4 selector = bytes4(keccak256("FailedToSendEther()"));
    vm.expectRevert(abi.encodeWithSelector(selector));

    pool.refund();
  }

  // Refund successfully
  function test_ExpectEmit_SuccessfullRefund() public {
    vm.prank(addr1);
    vm.deal(addr1, 6 ether);
    pool.contribute{value: 6 ether}();

    vm.prank(addr2);
    vm.deal(addr2, 1 ether);
    pool.contribute{value: 1 ether}();

    vm.warp(pool.end() + 3600);

    uint256 balanceBeforeRefund = addr2.balance;

    vm.prank(addr2);
    pool.refund();

    uint256 balanceAfterRefund = addr2.balance;
    assertEq(balanceBeforeRefund + 1 ether, balanceAfterRefund);
  }
}
