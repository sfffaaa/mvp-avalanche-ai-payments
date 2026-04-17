// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/AgentExecutor.sol";

contract Deploy is Script {
    // Known Fuji test addresses (no private key needed — just payment targets)
    address constant RESTAURANT   = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant API_PROVIDER = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address constant FREELANCER   = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PK");
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        MockUSDC usdc = new MockUSDC();
        // deployer is both owner and agent for demo simplicity
        AgentExecutor executor = new AgentExecutor(address(usdc), deployer);

        // Fund executor with 100 mUSDC
        usdc.mint(address(executor), 100_000_000);

        // Set policy: 10 mUSDC per tx, 3 allowed recipients
        address[] memory recipients = new address[](3);
        recipients[0] = RESTAURANT;
        recipients[1] = API_PROVIDER;
        recipients[2] = FREELANCER;
        executor.setPolicy(10_000_000, recipients);

        vm.stopBroadcast();

        console.log("MockUSDC deployed at:     ", address(usdc));
        console.log("AgentExecutor deployed at: ", address(executor));
        console.log("\nAdd to .env:");
        console.log("USDC_ADDRESS=", address(usdc));
        console.log("EXECUTOR_ADDRESS=", address(executor));
    }
}
