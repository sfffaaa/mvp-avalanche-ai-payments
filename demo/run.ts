import { AgentExecutorClient } from "../src/agent.js";
import { makeClient, runFoodAPI, runAPICredits, runFreelancer } from "../src/scenarios.js";

function requireHex(name: string): `0x${string}` {
  const val = process.env[name];
  if (!val || !val.startsWith("0x")) {
    console.error(`Missing or invalid env var ${name} — must be a hex string starting with 0x`);
    process.exit(1);
  }
  return val as `0x${string}`;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

async function runScenario(
  label: string,
  fn: (client: AgentExecutorClient) => Promise<{ hash: `0x${string}` }>,
  client: AgentExecutorClient,
  successLabel: string
): Promise<void> {
  console.log(label);
  try {
    const { hash } = await fn(client);
    console.log("  off-chain policy: APPROVE");
    console.log("  tx hash:", hash);
    console.log("  ✓", successLabel);
  } catch (e) {
    console.log("  ✗", errorMessage(e));
  }
  console.log("");
}

const EXECUTOR_ADDRESS = requireHex("EXECUTOR_ADDRESS");
const AGENT_PK = requireHex("AGENT_PK");

const client = makeClient(EXECUTOR_ADDRESS, AGENT_PK);

async function run() {
  console.log("=== Avalanche AI Payments Demo ===");
  console.log("Chain: Avalanche Fuji C-Chain");
  console.log("Executor:", EXECUTOR_ADDRESS);
  console.log("");

  await runScenario("[1/3] Food API payment (5 mUSDC)...", runFoodAPI, client, "5 mUSDC sent to restaurant");
  await runScenario("[2/3] API credits payment (2 mUSDC)...", runAPICredits, client, "2 mUSDC sent to API provider");

  console.log("[3/3] Freelancer payment (20 mUSDC, cap = 10 mUSDC)...");
  try {
    await runFreelancer(client);
    console.log("  (unexpected: should have been rejected)");
  } catch (e) {
    const msg = errorMessage(e);
    if (msg.includes("PolicyViolation")) {
      console.log("  off-chain policy: REJECT — amount_exceeds_limit");
      console.log("  ✗ Blocked before hitting chain");
    } else {
      console.log("  ✗", msg);
    }
  }
  console.log("");
  console.log("Done.");
}

run().catch(console.error);
