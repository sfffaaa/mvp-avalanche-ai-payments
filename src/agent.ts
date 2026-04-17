import { createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { checkPolicy } from "./policy.js";
import type { Policy, TxRequest } from "./types.js";

const RPC_URL = "https://avalanche-fuji-c-chain-rpc.publicnode.com";

const EXECUTOR_ABI = [
  {
    name: "execute",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export class AgentExecutorClient {
  private policy: Policy;
  private executorAddress: `0x${string}`;
  private privateKey: `0x${string}`;

  constructor(opts: {
    policy: Policy;
    executorAddress: `0x${string}`;
    privateKey: `0x${string}`;
  }) {
    this.policy = opts.policy;
    this.executorAddress = opts.executorAddress;
    this.privateKey = opts.privateKey;
  }

  async execute(tx: TxRequest): Promise<{ hash: `0x${string}` }> {
    // Layer 1: off-chain policy check (no gas)
    const result = checkPolicy(tx, this.policy);
    if (result.decision === "reject") {
      throw new Error(`PolicyViolation: ${result.reason}`);
    }

    // Layer 2: on-chain execute (contract re-enforces same limits)
    const account = privateKeyToAccount(this.privateKey);
    const walletClient = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http(RPC_URL),
    });

    const hash = await walletClient.writeContract({
      account,
      address: this.executorAddress,
      abi: EXECUTOR_ABI,
      functionName: "execute",
      args: [tx.to, parseUnits(tx.amount, 6)],
    });

    return { hash };
  }
}
