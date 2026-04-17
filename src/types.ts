export interface Policy {
  spendingLimitPerTx: string;   // "10" = 10 mUSDC
  allowedRecipients: string[];  // lowercase hex addresses
}

export interface TxRequest {
  to: `0x${string}`;
  amount: string;    // "5" = 5 mUSDC
  scenario: string;
}

export interface CheckResult {
  decision: "approve" | "reject";
  reason?: "recipient_not_allowed" | "amount_exceeds_limit";
}
