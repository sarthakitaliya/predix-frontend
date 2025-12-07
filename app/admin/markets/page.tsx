"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePrivy, useIdentityToken, useLogin } from "@privy-io/react-auth";
import { useUserStore } from "@/store/useUserStore";

interface Market {
    id: string; // UUID from backend
    market_id: string; // On-chain ID
    title: string;
    volume?: string; // Optional 
    status: string;
    close_time: string;
}

interface MarketsResponse {
    markets: Market[];
}

export default function MarketsPage() {
    const router = useRouter();
    const { ready, user, getAccessToken } = usePrivy();
    const { identityToken } = useIdentityToken();
    const { login } = useLogin();

    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user: storedUser} = useUserStore();
    useEffect(() => {
        console.log("Stored user in markets page:", storedUser);
    }, [storedUser]);
    
    const getAllMarkets = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const accessToken = await getAccessToken();
            const { data } = await axios.get<MarketsResponse>(
                "http://localhost:3030/admin/markets",
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                        "privy-id-token": identityToken,
                    },
                }
            );
            console.log("Fetched markets:", data);
            setMarkets(data.markets || []);
        } catch (error: any) {
            console.error("Error fetching data:", error);
            setError("Failed to load markets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ready && user) {
            getAllMarkets();
        } else if (ready && !user) {
            setLoading(false);
        }
    }, [ready, user]); // Depend on user/ready to refetch or stop loading

    const handleRowClick = (id: string) => {
        router.push(`/admin/markets/${id}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex justify-between h-10 w-full mb-8">
                    <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-32"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-zinc-800 rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Markets</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage all prediction markets from one place.</p>
                </div>
                <Link
                    href="/admin/markets/create"
                    className="bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                    </svg>
                    Create Market
                </Link>
            </div>

            {!user ? (
                <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg flex flex-col items-center justify-center gap-4">
                    <span className="text-yellow-800 dark:text-yellow-200 font-medium">Please login to view markets</span>
                    <button
                        onClick={() => login()}
                        className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold"
                    >
                        Login with Privy
                    </button>
                </div>
            ) : error ? (
                <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg text-center text-red-500">
                    {error}
                </div>
            ) : markets.length === 0 ? (
                <div className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-12 rounded-lg text-center text-zinc-500">
                    No markets found. Create one to get started.
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-950/5 dark:ring-white/5">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Title</th>
                                {/* Volume column removed as per new API response missing it */}
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">End Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {markets.map((market) => (
                                <tr
                                    key={market.id}
                                    onClick={() => handleRowClick(market.market_id)} // Use on-chain ID for details URL? Or UUID? Assuming market_id is more useful for details
                                    className="group hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-5">
                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">{market.title}</div>
                                        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">ID: {market.market_id}</div>
                                    </td>
                                    {/* <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300 font-medium tabular-nums">{market.volume}</td> */}
                                    <td className="px-6 py-5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${market.status === "open" // Backend returns lowercase "open"
                                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20"
                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-700"
                                                }`}
                                        >
                                            {market.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-zinc-600 dark:text-zinc-400 tabular-nums text-right">{formatDate(market.close_time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
