// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AgentExecutor {
    address public owner;
    address public agent;
    IERC20 public usdc;

    uint256 public spendingLimitPerTx;
    address[] private allowedRecipients;

    event PaymentExecuted(address indexed to, uint256 amount);

    error LimitExceeded();
    error RecipientNotAllowed();
    error Unauthorized();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAgent() {
        if (msg.sender != agent) revert Unauthorized();
        _;
    }

    constructor(address _usdc, address _agent) {
        owner = msg.sender;
        agent = _agent;
        usdc = IERC20(_usdc);
    }

    function setPolicy(uint256 _spendingLimitPerTx, address[] calldata _allowedRecipients) external onlyOwner {
        spendingLimitPerTx = _spendingLimitPerTx;
        delete allowedRecipients;
        for (uint256 i = 0; i < _allowedRecipients.length; i++) {
            allowedRecipients.push(_allowedRecipients[i]);
        }
    }

    function execute(address to, uint256 amount) external onlyAgent {
        if (amount > spendingLimitPerTx) revert LimitExceeded();

        bool allowed = false;
        for (uint256 i = 0; i < allowedRecipients.length; i++) {
            if (allowedRecipients[i] == to) {
                allowed = true;
                break;
            }
        }
        if (!allowed) revert RecipientNotAllowed();

        usdc.transfer(to, amount);
        emit PaymentExecuted(to, amount);
    }

    function getAllowedRecipients() external view returns (address[] memory) {
        return allowedRecipients;
    }
}
