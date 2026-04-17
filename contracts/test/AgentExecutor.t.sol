// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/AgentExecutor.sol";

contract AgentExecutorTest is Test {
    MockUSDC usdc;
    AgentExecutor executor;

    address agent = makeAddr("agent");
    address restaurant = makeAddr("restaurant");
    address apiProvider = makeAddr("apiProvider");
    address freelancer = makeAddr("freelancer");
    address unknown = makeAddr("unknown");

    uint256 constant LIMIT = 10_000_000;    // 10 mUSDC (6 decimals)
    uint256 constant BALANCE = 100_000_000; // 100 mUSDC

    function setUp() public {
        usdc = new MockUSDC();
        executor = new AgentExecutor(address(usdc), agent);

        usdc.mint(address(executor), BALANCE);

        address[] memory recipients = new address[](3);
        recipients[0] = restaurant;
        recipients[1] = apiProvider;
        recipients[2] = freelancer;
        executor.setPolicy(LIMIT, recipients);
    }

    function test_execute_happyPath() public {
        vm.prank(agent);
        executor.execute(restaurant, 5_000_000); // 5 mUSDC
        assertEq(usdc.balanceOf(restaurant), 5_000_000);
    }

    function test_execute_atExactLimit() public {
        vm.prank(agent);
        executor.execute(restaurant, LIMIT); // exactly 10 mUSDC
        assertEq(usdc.balanceOf(restaurant), LIMIT);
    }

    function test_execute_revertsWhenLimitExceeded() public {
        vm.prank(agent);
        vm.expectRevert(AgentExecutor.LimitExceeded.selector);
        executor.execute(restaurant, 20_000_000); // 20 mUSDC
    }

    function test_execute_revertsWhenRecipientNotAllowed() public {
        vm.prank(agent);
        vm.expectRevert(AgentExecutor.RecipientNotAllowed.selector);
        executor.execute(unknown, 5_000_000);
    }

    function test_execute_revertsForNonAgent() public {
        // address(this) is owner, not agent
        vm.expectRevert(AgentExecutor.Unauthorized.selector);
        executor.execute(restaurant, 5_000_000);
    }

    function test_setPolicy_revertsForNonOwner() public {
        address[] memory recipients = new address[](0);
        vm.prank(agent);
        vm.expectRevert(
            abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", agent)
        );
        executor.setPolicy(LIMIT, recipients);
    }

    function test_emitsPaymentExecuted() public {
        vm.prank(agent);
        vm.expectEmit(true, false, false, true);
        emit AgentExecutor.PaymentExecuted(restaurant, 5_000_000);
        executor.execute(restaurant, 5_000_000);
    }
}
