import { createWalletClient, http, parseUnits, type WalletClient } from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
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
  private account: PrivateKeyAccount;
  private walletClient: WalletClient;

  constructor(opts: {
    policy: Policy;
    executorAddress: `0x${string}`;
    privateKey: `0x${string}`;
  }) {
    this.policy = opts.policy;
    this.executorAddress = opts.executorAddress;
    this.account = privateKeyToAccount(opts.privateKey);
    this.walletClient = createWalletClient({
      account: this.account,
      chain: avalancheFuji,
      transport: http(RPC_URL),
    });
  }

  async execute(tx: TxRequest): Promise<{ hash: `0x${string}` }> {
    const result = checkPolicy(tx, this.policy);
    if (result.decision === "reject") {
      throw new Error(`PolicyViolation: ${result.reason}`);
    }

    const hash = await this.walletClient.writeContract({
      account: this.account,
      address: this.executorAddress,
      abi: EXECUTOR_ABI,
      functionName: "execute",
      args: [tx.to, parseUnits(tx.amount, 6)],
    });

    return { hash };
  }
}
