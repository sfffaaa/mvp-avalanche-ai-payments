import { isAddress, parseUnits } from "viem";
import type { Policy, TxRequest, CheckResult } from "./types.js";

// Max 6 decimal places (USDC precision), must be a positive number
const AMOUNT_RE = /^\d+(\.\d{1,6})?$/;

export function checkPolicy(tx: TxRequest, policy: Policy): CheckResult {
  if (!isAddress(tx.to)) {
    return { decision: "reject", reason: "recipient_not_allowed" };
  }

  if (!AMOUNT_RE.test(tx.amount) || parseFloat(tx.amount) <= 0) {
    return { decision: "reject", reason: "amount_exceeds_limit" };
  }

  if (policy.allowedRecipients.length > 0) {
    if (!policy.allowedRecipients.includes(tx.to.toLowerCase())) {
      return { decision: "reject", reason: "recipient_not_allowed" };
    }
  }

  const limit = parseUnits(policy.spendingLimitPerTx, 6);
  const amount = parseUnits(tx.amount, 6);
  if (amount > limit) {
    return { decision: "reject", reason: "amount_exceeds_limit" };
  }

  return { decision: "approve" };
}
