"use client";
import { usePrivy, type WalletWithMetadata } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  useSignAndSendTransaction,
  useWallets,
  useExportWallet,
  useFundWallet,
} from "@privy-io/react-auth/solana";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, ready, logout } = usePrivy();
  const router = useRouter();

  // Wallet / USDC Logic
  const { balance, refetch, isRefreshing } = useUSDCBalance();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { wallets } = useWallets();
  const { exportWallet } = useExportWallet();
  const { fundWallet } = useFundWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const handleExportWallet = async () => {
    if (!user?.wallet?.address) return;
    try {
      const hasEmbeddedWallet = !!user.linkedAccounts.find(
        (account) =>
          account.type === "wallet" &&
          account.walletClientType === "privy" &&
          account.chainType === "solana"
      );
      console.log(user.linkedAccounts);
      
      console.log(hasEmbeddedWallet);
      
      if (hasEmbeddedWallet) {
        await exportWallet();
      } else {
        toast.error("No embedded wallet found to export private key from.");
      }
    } catch (e: any) {
      console.error("Export failed:", e);
      toast.error(`Export Error: ${e.message || "Unable to export"}`);
    }
  };
  const handleDeposit = async () => {
    if (!user?.wallet?.address) return;
    try {
      await fundWallet({
        address: user.wallet.address,
        options: {
          defaultFundingMethod: "manual",
          chain: "solana:devnet",
          asset: "USDC",
        },
      } as any);
    } catch (e: any) {
      console.error("Deposit failed:", e);
      toast.error(`Deposit Error: ${e.message || "Unable to connect"}`);
    }
  };

  const handleSendUSDC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !user?.wallet?.address ||
      !amount ||
      parseFloat(amount) <= 0 ||
      !recipient
    )
      return;

    const selectedWallet =
      wallets.find((w) => w.address === user.wallet?.address) || wallets[0];
    if (!selectedWallet) {
      toast.error("No wallet connected");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast.error("Insufficient USDC balance");
      return;
    }

    try {
      setSending(true);
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"
      );
      const userPublicKey = new PublicKey(user.wallet.address);
      const recipientPublicKey = new PublicKey(recipient);
      const usdcMint = new PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
      );

      // Get Associated Token Addresses
      const userTokenAddress = await getAssociatedTokenAddress(
        usdcMint,
        userPublicKey
      );
      const recipientTokenAddress = await getAssociatedTokenAddress(
        usdcMint,
        recipientPublicKey
      );

      // Create Transaction
      const transaction = new Transaction().add(
        createTransferInstruction(
          userTokenAddress,
          recipientTokenAddress,
          userPublicKey,
          Math.floor(parseFloat(amount) * 1_000_000) // 6 decimals
        )
      );

      // Serialize for Privy
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
      });

      // Sign and Send via Privy
      await signAndSendTransaction({
        transaction: serializedTx,
        wallet: selectedWallet,
        chain: "solana:devnet",
      });

      toast.success(`Sent ${amount} USDC successfully!`);
      setAmount("");
      setRecipient("");
      // Refresh balance
      refetch();
    } catch (error: any) {
      console.error("Send error:", error);
      // Handling case where recipient might not have a USDC account yet, which requires creating it first.
      // For MVP, we assume recipient has a token account or we let it fail with specific error.
      if (
        error.message?.includes("TokenAccountNotFoundError") ||
        error.message?.includes("Account not found")
      ) {
        toast.error(
          "Recipient does not have a USDC token account. Creation not supported in this simple view."
        );
      } else {
        toast.error("Failed to send USDC: " + error.message);
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (ready && !user) {
      router.push("/");
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  // Derived user info
  const googleAccount = user.linkedAccounts.find(
    (a) => a.type === "google_oauth"
  ) as any;
  const walletAccount = user.linkedAccounts.find(
    (a) => a.type === "wallet" && a.chainType === "solana"
  ) as any;
  const emailAccount = user.linkedAccounts.find(
    (a) => a.type === "email"
  ) as any;

  const email = googleAccount?.email || emailAccount?.address;
  const address = walletAccount?.address || user.wallet?.address;
  const displayName =
    googleAccount?.name ||
    (email
      ? email.split("@")[0]
      : address
      ? address.slice(0, 6) + "..." + address.slice(-4)
      : "User");
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {displayName}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center md:gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-xs mt-1">
                {email && <span className="md:mr-2">{email}</span>}
                {address && (
                  <div className="flex items-center gap-1">
                    <span>
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address);
                      }}
                      className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeposit}
              className="px-4 py-2 bg-[#07C285] hover:bg-[#06a874] text-white rounded-lg font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              Deposit
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Wallet Only Content */}
        <div className="max-w-xl mx-auto space-y-6">
          {/* Balance Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">
                  Available Balance
                </div>
                <div
                  className={`text-3xl font-black text-zinc-900 dark:text-white transition-all duration-500 ${
                    isRefreshing ? "animate-pulse text-green-500" : ""
                  }`}
                >
                  {balance}{" "}
                  <span className="text-lg font-bold text-zinc-400">USDC</span>
                </div>
              </div>
              <button
                onClick={handleExportWallet}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Export Private Key
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Address
              </span>
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 break-all">
                {user?.wallet?.address}
              </span>
            </div>
          </div>

          {/* Send USDC Logic */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold mb-4">Send USDC</h3>
            <form onSubmit={handleSendUSDC} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Solana Wallet Address"
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Amount (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-base font-bold"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                    USDC
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={sending}
                className={`w-full py-3 bg-[#07C285] hover:bg-[#06a874] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer ${
                  sending ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {sending ? "Processing..." : "Send Transaction"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
