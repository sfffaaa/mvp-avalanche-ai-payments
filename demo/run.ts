import { makeClient, runFoodAPI, runAPICredits, runFreelancer } from "../src/scenarios.js";

const EXECUTOR_ADDRESS = process.env.EXECUTOR_ADDRESS as `0x${string}`;
const AGENT_PK = process.env.AGENT_PK as `0x${string}`;

if (!EXECUTOR_ADDRESS || !AGENT_PK) {
  console.error(
    "Missing env vars. Set EXECUTOR_ADDRESS and AGENT_PK.\n" +
    "See README for how to deploy contracts to Fuji first."
  );
  process.exit(1);
}

const client = makeClient(EXECUTOR_ADDRESS, AGENT_PK);

async function run() {
  console.log("=== Avalanche AI Payments Demo ===");
  console.log("Chain: Avalanche Fuji C-Chain");
  console.log("Executor:", EXECUTOR_ADDRESS);
  console.log("");

  // Scenario 1: Food API
  console.log("[1/3] Food API payment (5 mUSDC)...");
  try {
    const { hash } = await runFoodAPI(client);
    console.log("  off-chain policy: APPROVE");
    console.log("  tx hash:", hash);
    console.log("  ✓ 5 mUSDC sent to restaurant");
  } catch (e) {
    console.log("  ✗", (e as Error).message);
  }
  console.log("");

  // Scenario 2: API Credits
  console.log("[2/3] API credits payment (2 mUSDC)...");
  try {
    const { hash } = await runAPICredits(client);
    console.log("  off-chain policy: APPROVE");
    console.log("  tx hash:", hash);
    console.log("  ✓ 2 mUSDC sent to API provider");
  } catch (e) {
    console.log("  ✗", (e as Error).message);
  }
  console.log("");

  // Scenario 3: Freelancer — intentionally exceeds cap
  console.log("[3/3] Freelancer payment (20 mUSDC, cap = 10 mUSDC)...");
  try {
    await runFreelancer(client);
    console.log("  (unexpected: should have been rejected)");
  } catch (e) {
    const msg = (e as Error).message;
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
