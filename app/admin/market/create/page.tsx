"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  usePrivy,
  useIdentityToken,
  useLogin,
  type WalletWithMetadata,
} from "@privy-io/react-auth";

interface CreateMarketRequest {
  market_id: number; // u64 (ensure it stays within JS safe integer range)
  metadata: string;
  collateral_mint: string;
  expiration_timestamp: number; // i64
}

export default function CreateMarketPage() {
  const { ready, user, getAccessToken, logout } = usePrivy();
  const { identityToken } = useIdentityToken();

  const { login } = useLogin({
    onComplete: async () => {
      // Post-login logic if needed
    },
  });

  const [form, setForm] = useState<CreateMarketRequest>({
    market_id: 111111112,
    metadata: "does this work?",
    collateral_mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    expiration_timestamp: Math.floor(Date.now() / 1000) + 432000, // default 5d from now
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Optional: preload embedded Solana wallet address if needed for default collateral mint
  useEffect(() => {
    if (!user) return;
    const solanaWallet = user.linkedAccounts.filter(
      (account): account is WalletWithMetadata =>
        account.type === "wallet" &&
        account.chainType === "solana" &&
        account.connectorType === "embedded"
    );
    // If you want to auto-fill collateral mint or some metadata based on wallet, do it here.
  }, [user]);

  function updateField<K extends keyof CreateMarketRequest>(key: K, value: string) {
    setForm((prev) => {
      if (key === "market_id" || key === "expiration_timestamp") {
        // Parse numbers safely
        const num = Number(value);
        return { ...prev, [key]: isNaN(num) ? 0 : num } as CreateMarketRequest;
      }
      return { ...prev, [key]: value } as CreateMarketRequest;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!form.metadata.trim()) {
      setError("Metadata is required");
      return;
    }
    if (!form.collateral_mint.trim()) {
      setError("Collateral mint is required");
      return;
    }
    if (form.market_id <= 0) {
      setError("Market ID must be > 0");
      return;
    }
    if (form.expiration_timestamp <= Math.floor(Date.now() / 1000)) {
      setError("Expiration timestamp must be in the future");
      return;
    }

    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      const body = {
        market_id: form.market_id,
        metadata: form.metadata,
        collateral_mint: form.collateral_mint,
        expiration_timestamp: form.expiration_timestamp,
      };
      const { data } = await axios.post(
        "http://localhost:3030/admin/market/create",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
        }
      );
      setSuccess("Market created successfully");
      console.log("Create market response", data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create market");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-10">
      <h1 className="text-2xl font-semibold mb-6">Create Market (Admin)</h1>
      {!user && (
        <button
          onClick={() => login()}
          className="mb-6 rounded-full bg-white/10 px-8 py-2 font-semibold hover:bg-white/20"
        >
          Login with Privy
        </button>
      )}
      {user && (
        <button
          onClick={() => logout()}
          className="mb-6 rounded-full bg-white/10 px-8 py-2 font-semibold hover:bg-white/20"
        >
          Logout
        </button>
      )}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm mb-1">Market ID (u64)</label>
          <input
            type="number"
            min={1}
            value={form.market_id}
            onChange={(e) => updateField("market_id", e.target.value)}
            className="w-full rounded-md bg-white/10 px-3 py-2 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Metadata (string)</label>
          <input
            type="text"
            value={form.metadata}
            onChange={(e) => updateField("metadata", e.target.value)}
            className="w-full rounded-md bg-white/10 px-3 py-2 outline-none"
            placeholder="e.g. Market description JSON or plain text"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Collateral Mint (string)</label>
          <input
            type="text"
            value={form.collateral_mint}
            onChange={(e) => updateField("collateral_mint", e.target.value)}
            className="w-full rounded-md bg-white/10 px-3 py-2 outline-none"
            placeholder="e.g. USDC mint address"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Expiration Timestamp (Unix seconds)</label>
          <input
            type="number"
            value={form.expiration_timestamp}
            onChange={(e) => updateField("expiration_timestamp", e.target.value)}
            className="w-full rounded-md bg-white/10 px-3 py-2 outline-none"
            required
          />
          <p className="text-xs opacity-70 mt-1">
            Current time: {Math.floor(Date.now() / 1000)}
          </p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}
        <button
          type="submit"
          disabled={loading || !user}
          className="w-full rounded-full bg-white/10 px-6 py-2 font-semibold hover:bg-white/20 disabled:opacity-40"
        >
          {loading ? "Creating..." : "Create Market"}
        </button>
      </form>
      <div className="mt-6 max-w-lg text-xs opacity-70">
        <p>
          Ensure `market_id` does not exceed JavaScript's safe integer range if
          very large (use smaller IDs or server-side mapping).
        </p>
      </div>
    </div>
  );
}
