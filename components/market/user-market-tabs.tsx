"use client";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { UserPositions } from "./user-positions";
import { UserOpenOrders } from "./user-open-orders";

// Minimal History Component (New, based on screenshot requirement)
const UserHistory = ({ marketId }: { marketId: string }) => (
    <div className="text-zinc-500 dark:text-zinc-400 text-sm py-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
        No history available for this market.
    </div>
);

export const UserMarketTabs = ({ marketId }: { marketId: string }) => {
    const { user } = usePrivy();
    const [activeTab, setActiveTab] = useState<"positions" | "orders" | "history">("positions");

    if (!user) return null;

    return (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <button
                    onClick={() => setActiveTab("positions")}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "positions"
                        ? "border-black dark:border-white text-black dark:text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                >
                    Positions
                </button>
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "orders"
                        ? "border-black dark:border-white text-black dark:text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                >
                    Open Orders
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "history"
                        ? "border-black dark:border-white text-black dark:text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                >
                    History
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[200px]">
                {activeTab === "positions" && <UserPositions marketId={marketId} isEmbedded />}
                {activeTab === "orders" && <UserOpenOrders marketId={marketId} isEmbedded />}
                {activeTab === "history" && <UserHistory marketId={marketId} />}
            </div>
        </div>
    );
};
