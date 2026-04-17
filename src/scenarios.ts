import { AgentExecutorClient } from "./agent.js";
import type { Policy } from "./types.js";

// Hardcoded recipient addresses (same as in Deploy.s.sol)
export const RESTAURANT =
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8" as const;
export const API_PROVIDER =
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc" as const;
export const FREELANCER =
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906" as const;

const POLICY: Policy = {
  spendingLimitPerTx: "10",
  allowedRecipients: [RESTAURANT, API_PROVIDER, FREELANCER],
};

export function makeClient(
  executorAddress: `0x${string}`,
  privateKey: `0x${string}`
): AgentExecutorClient {
  return new AgentExecutorClient({ policy: POLICY, executorAddress, privateKey });
}

// Scenario 1: agent pays food delivery API — 5 mUSDC, within cap → approve
export async function runFoodAPI(
  client: AgentExecutorClient
): Promise<{ hash: `0x${string}` }> {
  return client.execute({
    to: RESTAURANT,
    amount: "5",
    scenario: "Food API",
  });
}

// Scenario 2: agent buys API credits — 2 mUSDC, within cap → approve
export async function runAPICredits(
  client: AgentExecutorClient
): Promise<{ hash: `0x${string}` }> {
  return client.execute({
    to: API_PROVIDER,
    amount: "2",
    scenario: "API Credits",
  });
}

// Scenario 3: agent tries to pay freelancer — 20 mUSDC, exceeds 10 mUSDC cap → reject
export async function runFreelancer(
  client: AgentExecutorClient
): Promise<{ hash: `0x${string}` }> {
  return client.execute({
    to: FREELANCER,
    amount: "20",
    scenario: "Freelancer",
  });
}
