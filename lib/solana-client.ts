import { SOLANA_RPC_URL } from "./constants"
import type { SolanaRpcResponse, TokenAccountInfo, TransactionSignature, ValidatorInfo } from "./types"

/**
 * Solana RPC client wrapper
 * In production, use @solana/web3.js for full functionality
 */

export async function getSolanaBalance(address: string): Promise<number> {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    // Convert lamports to SOL
    return data.result.value / 1_000_000_000
  } catch (error) {
    console.error("[v0] Error fetching balance:", error)
    throw error
  }
}

export async function getTokenAccounts(address: string): Promise<TokenAccountInfo[]> {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [address, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }],
      }),
    })

    const data: SolanaRpcResponse<{ value: TokenAccountInfo[] }> = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    return data.result.value
  } catch (error) {
    console.error("[v0] Error fetching token accounts:", error)
    throw error
  }
}

export async function getTransactionHistory(address: string, limit = 10): Promise<TransactionSignature[]> {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [address, { limit }],
      }),
    })

    const data: SolanaRpcResponse<TransactionSignature[]> = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    return data.result
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    throw error
  }
}

export async function getAccountInfo(address: string) {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [address, { encoding: "jsonParsed" }],
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    return data.result.value
  } catch (error) {
    console.error("[v0] Error fetching account info:", error)
    throw error
  }
}

export async function getValidatorInfo(voteAccount: string): Promise<ValidatorInfo | null> {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getVoteAccounts",
        params: [],
      }),
    })

    const data: SolanaRpcResponse<{ current: ValidatorInfo[]; delinquent: ValidatorInfo[] }> = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    // Find specific validator
    const allValidators = [...data.result.current, ...data.result.delinquent]
    const validator = allValidators.find((v) => v.votePubkey === voteAccount)

    return validator || null
  } catch (error) {
    console.error("[v0] Error fetching validator info:", error)
    throw error
  }
}
