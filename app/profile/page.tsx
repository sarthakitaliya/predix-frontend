"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserPositions } from "@/components/market/user-positions";
import { UserOpenOrders } from "@/components/market/user-open-orders";

// Placeholder for now, assuming we might repurpose these or create global versions
// For MVP, we'll try to use them but note that they expect a marketId currently.
// I will create a separate "GlobalPositions" view if needed later, but for now 
// I'll leave the tables empty or with a placeholder message if no marketId is appropriate, 
// OR I will simply mock the global view structure.

// Actually, let's create a specialized "GlobalPortfolio" view in this file for now 
// to ensure it looks distinct from the Market view.

const StatsCard = ({ label, value, subValue, type = "neutral" }: { label: string, value: string, subValue?: string, type?: "neutral" | "positive" | "negative" }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">{label}</div>
        <div className="text-3xl font-black text-zinc-900 dark:text-white mb-1">{value}</div>
        {subValue && (
            <div className={`text-sm font-bold ${type === "positive" ? "text-green-500" : type === "negative" ? "text-red-500" : "text-zinc-500"
                }`}>
                {subValue}
            </div>
        )}
    </div>
);

export default function ProfilePage() {
    const { user, ready, logout } = usePrivy();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "history" | "settings">("overview");

    useEffect(() => {
        if (ready && !user) {
            router.push("/");
        }
    }, [ready, user, router]);

    if (!ready || !user) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Loading profile...</div></div>;
    }

    // Derived user info
    const googleAccount = user.linkedAccounts.find(a => a.type === "google_oauth") as any;
    const walletAccount = user.linkedAccounts.find(a => a.type === "wallet") as any;
    const emailAccount = user.linkedAccounts.find(a => a.type === "email") as any;

    const email = googleAccount?.email || emailAccount?.address;
    const address = walletAccount?.address || user.wallet?.address;
    const displayName = googleAccount?.name || (email ? email.split('@')[0] : (address ? address.slice(0, 6) + "..." + address.slice(-4) : "User"));
    const initial = displayName[0]?.toUpperCase() || "U";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                            {initial}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
                                {displayName}
                            </h1>
                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-sm mt-1">
                                {email && <span className="mr-2">{email}</span>}
                                {address && (
                                    <>
                                        <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(address); }}
                                            className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Edit Profile
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatsCard label="Portfolio Value" value="$1,240.50" subValue="+12.5% this week" type="positive" />
                    <StatsCard label="Total PnL" value="+$450.22" subValue="All time" type="positive" />
                    <StatsCard label="Volume Traded" value="$12,500" subValue="32 Trades" />
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-6">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-4 px-2 text-sm font-bold border-b-2 transition-colors mr-6 ${activeTab === "overview"
                                ? "border-black dark:border-white text-black dark:text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`py-4 px-2 text-sm font-bold border-b-2 transition-colors mr-6 ${activeTab === "history"
                                ? "border-black dark:border-white text-black dark:text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`py-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "settings"
                                ? "border-black dark:border-white text-black dark:text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Settings
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === "overview" && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Active Positions</h3>
                                    {/* Temporary placeholder using the market-specific component, ideally we'd pass a 'global' flag or fetch data here */}
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-8 text-center text-zinc-500 dark:text-zinc-400">
                                        <p>Global positions view coming soon.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-8 text-center text-zinc-500 dark:text-zinc-400">
                                <p>Trade history view coming soon.</p>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="max-w-xl">
                                <h3 className="text-lg font-bold mb-4">Account Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                        <div>
                                            <div className="font-bold">Email Notifications</div>
                                            <div className="text-sm text-zinc-500">Receive updates about your trades</div>
                                        </div>
                                        <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
