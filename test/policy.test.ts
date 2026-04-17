import { checkPolicy } from "../src/policy.js";
import type { Policy, TxRequest } from "../src/types.js";

const POLICY: Policy = {
  spendingLimitPerTx: "10",
  allowedRecipients: ["0x70997970c51812dc3a010c7d01b50e0d17dc79c8"],
};

const ALLOWED_TX: TxRequest = {
  to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  amount: "5",
  scenario: "test",
};

describe("checkPolicy", () => {
  it("returns approve when amount is below limit and recipient is allowed", () => {
    expect(checkPolicy(ALLOWED_TX, POLICY).decision).toBe("approve");
  });

  it("returns approve at exact limit", () => {
    const tx: TxRequest = { ...ALLOWED_TX, amount: "10" };
    expect(checkPolicy(tx, POLICY).decision).toBe("approve");
  });

  it("returns reject when amount exceeds limit", () => {
    const tx: TxRequest = { ...ALLOWED_TX, amount: "20" };
    const result = checkPolicy(tx, POLICY);
    expect(result.decision).toBe("reject");
    expect(result.reason).toBe("amount_exceeds_limit");
  });

  it("returns reject when recipient is not allowed", () => {
    const tx: TxRequest = {
      ...ALLOWED_TX,
      to: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    };
    const result = checkPolicy(tx, POLICY);
    expect(result.decision).toBe("reject");
    expect(result.reason).toBe("recipient_not_allowed");
  });

  it("recipient check takes priority over amount check", () => {
    const tx: TxRequest = {
      to: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      amount: "20",
      scenario: "test",
    };
    const result = checkPolicy(tx, POLICY);
    expect(result.decision).toBe("reject");
    expect(result.reason).toBe("recipient_not_allowed");
  });
});
