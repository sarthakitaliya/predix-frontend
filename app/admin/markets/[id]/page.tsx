"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { usePrivy, useIdentityToken, useLogin } from "@privy-io/react-auth";
import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import { toast } from "sonner";
import { useParams } from 'next/navigation'

interface Market {
    id: string;
    market_id: string; // On-chain ID
    title: string;
    description?: string;
    status: string;
    close_time: string;
    category: string;
    outcome?: string;
}

interface MarketResponse {
    market: Market;
}

export default function MarketDetailPage() {
    const {id} = useParams<{ id: string }>();
    
    const router = useRouter();
    const { ready, user, getAccessToken } = usePrivy();
    const { identityToken } = useIdentityToken();
    const { login } = useLogin();

    const [market, setMarket] = useState<Market | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [outcome, setOutcome] = useState<"yes" | "no" | null>(null);
    const { signAndSendTransaction } = useSignAndSendTransaction();
    const { wallets } = useWallets();
    const selectedWallet = wallets[0];


    useEffect(() => {
        const fetchMarket = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const accessToken = await getAccessToken();
                const { data } = await axios.get<MarketResponse>(
                    `http://localhost:3030/markets/${id}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                            "privy-id-token": identityToken,
                        },
                    }
                );
                const foundMarket = data.market;
                if (foundMarket) {
                    setMarket(foundMarket);
                } else {
                    setError("Market not found");
                }
            } catch (err: any) {
                console.error("Error fetching market:", err);
                setError("Failed to load market details");
            } finally {
                setLoading(false);
            }
        };

        if (ready) {
            if (user) {
                fetchMarket();
            } else {
                setLoading(false); // Stop loading if not logged in
            }
        }
    }, [id, ready, user]);

    const handleResolve = async () => {
        if (!outcome) return;
        try {
            setLoading(true);
            const accessToken = await getAccessToken();
            const body = {
                market_id: id,
                outcome: outcome,
            };
            const { data } = await axios.post(
                "http://localhost:3030/admin/market/set-winner",
                body,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                        "privy-id-token": identityToken,
                    },
                }
            );
            console.log(data);
            const raw = Buffer.from(data.tx_message, "base64");
            //convert tx to uint8array
            const txUint8Array = new Uint8Array(raw);
            const txSignature = await signAndSendTransaction({
                transaction: txUint8Array,
                wallet: selectedWallet!,
                chain: "solana:devnet",
            });
            toast.success("Market resolved successfully");
            router.refresh();
        } catch (err: any) {
            console.error("Error resolving market:", err);
            toast.error(err?.response?.data?.message || "Failed to resolve market");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
        });
    };

    if (loading)
        return (
            <div className="max-w-5xl mx-auto py-8 space-y-8 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-32"></div>
                <div className="h-24 bg-gray-200 dark:bg-zinc-800 rounded-xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
                    <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
                </div>
            </div>
        );

    if (!user)
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg flex flex-col items-center justify-center gap-4">
                    <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                        Please login to view market details
                    </span>
                    <button
                        onClick={() => login()}
                        className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold"
                    >
                        Login with Privy
                    </button>
                </div>
            </div>
        );

    if (error || !market)
        return (
            <div className="max-w-5xl mx-auto py-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                        Error
                    </h3>
                    <p className="text-red-500 dark:text-red-300">
                        {error || "Market data unavailable"}
                    </p>
                    <Link
                        href="/admin/markets"
                        className="mt-4 inline-block text-sm font-bold underline"
                    >
                        Back to Markets
                    </Link>
                </div>
            </div>
        );

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8">
            <div>
                <Link
                    href="/admin/markets"
                    className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 inline-flex items-center transition-colors"
                >
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        ></path>
                    </svg>
                    Back to Markets
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 uppercase tracking-wide">
                            {market.category || "General"}
                        </span>
                        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                            {market.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6 bg-white dark:bg-zinc-900 px-6 py-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        {/* Volume removed as per new API */}
                        <div>
                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Status
                            </div>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                                {market.status}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm ring-1 ring-gray-950/5 dark:ring-white/5">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                            Resolution Rules
                        </h3>
                        <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed text-base">
                            {market.description ||
                                "No specific resolution rules provided for this market."}
                        </p>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                    Close Time
                                </div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {formatDate(market.close_time)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                    Market ID
                                </div>
                                <div className="font-mono text-sm text-zinc-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 inline-block px-2 py-1 rounded break-all">
                                    {market.market_id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions (Resolve) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm ring-1 ring-gray-950/5 dark:ring-white/5 sticky top-24">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                            Resolve Market
                        </h3>

                        {market.status === "resolved" ? (
                            <div className="mb-6">
                                <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg text-center">
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">Market Resolved As</p>
                                    <p className={`text-3xl font-black ${market.outcome === "Yes" || market.outcome === "yes" ? "text-green-600 dark:text-green-400" :
                                        market.outcome === "No" || market.outcome === "no" ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-white"
                                        }`}>
                                        {market.outcome?.toUpperCase() || "UNKNOWN"}
                                    </p>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300 text-center">
                                    This market has been finalized on-chain.
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-normal">
                                    Select the winning outcome to finalize this market.
                                    <br />
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                        This action is irreversible.
                                    </span>
                                </p>

                                <div className="space-y-3 mb-8">
                                    <button
                                        onClick={() => setOutcome("yes")}
                                        className={`w-full py-4 px-4 rounded-xl font-bold border-2 transition-all flex items-center justify-between group ${outcome === "yes"
                                            ? "border-green-600 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 shadow-sm"
                                            : "border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:border-green-400 dark:hover:border-green-500/50 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
                                            }`}
                                    >
                                        <span>YES</span>
                                        {outcome === "yes" && (
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                ></path>
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setOutcome("no")}
                                        className={`w-full py-4 px-4 rounded-xl font-bold border-2 transition-all flex items-center justify-between group ${outcome === "no"
                                            ? "border-red-600 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm"
                                            : "border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:border-red-400 dark:hover:border-red-500/50 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
                                            }`}
                                    >
                                        <span>NO</span>
                                        {outcome === "no" && (
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                ></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <button
                                    disabled={!outcome}
                                    onClick={handleResolve}
                                    className={`w-full py-3.5 font-bold rounded-xl text-white transition-all shadow-md ${outcome
                                        ? "bg-black dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-gray-200 active:transform active:scale-95"
                                        : "bg-gray-200 dark:bg-zinc-800 cursor-not-allowed text-gray-400 dark:text-zinc-600 shadow-none"
                                        }`}
                                >
                                    Confirm Resolution
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
