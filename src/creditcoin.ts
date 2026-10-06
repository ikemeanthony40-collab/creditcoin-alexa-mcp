import { ethers } from "ethers";

const REPUTATION_REGISTRY_ABI = [
  "function getReputation(address wallet) view returns (uint256 verifiedScore, uint256 estimatedScore, uint8 tier, uint256 lastUpdated)"
];

const TIER_NAMES = [
  "Unrated",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
] as const;

export interface CreditcoinReputation {
  wallet: string;
  verifiedScore: number;
  estimatedScore: number;
  totalScore: number;
  tier: string;
  lastUpdated: number;
}

export async function getCreditcoinReputation(
  walletAddress: string,
): Promise<CreditcoinReputation> {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`Invalid Ethereum wallet address: ${walletAddress}`);
  }

  const rpcUrl = process.env.CREDITCOIN_RPC_URL;
  const registryAddress = process.env.REPUTATION_REGISTRY_ADDRESS;

  if (!rpcUrl) {
    throw new Error("CREDITCOIN_RPC_URL is not configured");
  }

  if (!registryAddress) {
    throw new Error("REPUTATION_REGISTRY_ADDRESS is not configured");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const registry = new ethers.Contract(
    registryAddress,
    REPUTATION_REGISTRY_ABI,
    provider,
  );

  const reputation = await registry.getReputation(walletAddress);

  const verifiedScore = Number(reputation[0]);
  const estimatedScore = Number(reputation[1]);
  const tierIndex = Number(reputation[2]);
  const lastUpdated = Number(reputation[3]);

  return {
    wallet: walletAddress,
    verifiedScore,
    estimatedScore,
    totalScore: Math.min(1000, verifiedScore + estimatedScore),
    tier: TIER_NAMES[tierIndex] ?? `Unknown (${tierIndex})`,
    lastUpdated,
  };
}
