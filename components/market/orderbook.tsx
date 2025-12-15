"use client";

import { useEffect, useState } from "react";
import api from "@/app/utils/axiosInstance";

interface OrderbookProps {
    outcome: "yes" | "no";
    marketId: string;
}

interface SnapshotData {
    price: number | string;
    quantity: number | string;
    total: number | string;
}

interface MarketSnapshot {
    yes: [SnapshotData[], SnapshotData[]]; // [bids, asks]
    no: [SnapshotData[], SnapshotData[]];  // [bids, asks]
}

export const Orderbook = ({ outcome, marketId }: OrderbookProps) => {
    const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
    const [loading, setLoading] = useState(true);

    const safeFloat = (val: string | number) => typeof val === 'string' ? parseFloat(val) : val;

    useEffect(() => {
        const fetchOrderbook = async () => {
            try {
                // setLoading(true); // Don't reset loading on simple refresh intervals if we add polling later
                const { data } = await api.get<MarketSnapshot>(`/orderbook/snapshot/${marketId}`);
                setSnapshot(data);
            } catch (err) {
                console.error("Failed to fetch orderbook:", err);
            } finally {
                setLoading(false);
            }
        };

        if (marketId) {
            fetchOrderbook();
            // Optional: Helper to poll every few seconds could go here
            const interval = setInterval(fetchOrderbook, 2000);
            return () => clearInterval(interval);
        }
    }, [marketId]);

    // Derived State
    const currentData = snapshot ? snapshot[outcome] : null;
    const bids = currentData ? currentData[0] : [];
    const asks = currentData ? currentData[1] : [];

    // Stats
    const bestBid = bids.length > 0 ? safeFloat(bids[0].price) : 0;
    const bestAsk = asks.length > 0 ? safeFloat(asks[0].price) : 0;
    const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
    // const lastPrice = outcome === "yes" ? 0.78 : 0.22; // Placeholder, real last price needs separate endpoint or derivation

    // Static Colors for Bids (Green) and Asks (Red)
    const bidText = "text-green-600 dark:text-green-400";
    const bidBg = "bg-green-100 dark:bg-green-900/20";
    const bidHover = "hover:bg-green-50 dark:hover:bg-green-900/10";

    const askText = "text-red-600 dark:text-red-400";
    const askBg = "bg-red-100 dark:bg-red-900/20";
    const askHover = "hover:bg-red-50 dark:hover:bg-red-900/10";

    if (loading && !snapshot) {
        return (
            <div className="mt-8 animate-pulse space-y-4">
                <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded"></div>)}
                    </div>
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8 transition-all">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Order Book ({outcome === "yes" ? "Yes" : "No"})
                </h3>
                <div className="flex gap-4 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 py-1 px-3 rounded-md">
                    <span className="text-zinc-500">Spread: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{Math.abs(spread).toFixed(2)}</span></span>
                    {/* <span className="text-zinc-300 dark:text-zinc-600">|</span> */}
                    {/* <span className="text-zinc-500">Last: <span className="font-bold text-zinc-900 dark:text-white">{lastPrice}</span></span> */}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span>Bid</span>
                        <span>Quantity</span>
                    </div>
                    <div className="space-y-1">
                        {bids.length === 0 && <div className="text-xs text-zinc-400 text-center py-4">No bids</div>}
                        {bids.slice(0, 10).map((bid, i) => (
                            <div key={i} className={`flex justify-between text-sm font-mono relative group cursor-pointer ${bidHover} rounded px-1 -mx-1 transition-colors`}>
                                <span className={`font-bold ${bidText}`}>{safeFloat(bid.price).toFixed(2)}</span>
                                <span className="text-zinc-600 dark:text-zinc-400">{safeFloat(bid.quantity).toLocaleString()}</span>
                                <div className={`absolute inset-y-0 right-0 ${bidBg} opacity-0 group-hover:opacity-100 w-full -z-10 rounded`}></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span>Ask</span>
                        <span>Quantity</span>
                    </div>
                    <div className="space-y-1">
                        {asks.length === 0 && <div className="text-xs text-zinc-400 text-center py-4">No asks</div>}
                        {asks.slice(0, 10).map((ask, i) => (
                            <div key={i} className={`flex justify-between text-sm font-mono relative group cursor-pointer ${askHover} rounded px-1 -mx-1 transition-colors`}>
                                <span className={`font-bold ${askText}`}>{safeFloat(ask.price).toFixed(2)}</span>
                                <span className="text-zinc-600 dark:text-zinc-400">{safeFloat(ask.quantity).toLocaleString()}</span>
                                <div className={`absolute inset-y-0 right-0 ${askBg} opacity-0 group-hover:opacity-100 w-full -z-10 rounded`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
