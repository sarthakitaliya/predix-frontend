"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

interface Position {
    outcome: "yes" | "no";
    amount: number;
    avgPrice: number;
    currentPrice: number;
}

export const UserPositions = ({ marketId, isEmbedded = false }: { marketId: string, isEmbedded?: boolean }) => {
    const { user } = usePrivy();

    // Placeholder - Replace with API call
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    if (positions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 dark:text-zinc-600">
                <p>No positions found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-zinc-500 dark:text-zinc-400">
                <thead className="text-xs uppercase border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
                    <tr>
                        <th className="px-4 py-3 font-medium">Outcome</th>
                        <th className="px-4 py-3 font-medium">Total Size</th>
                        <th className="px-4 py-3 font-medium">Value</th>
                        <th className="px-4 py-3 font-medium">Avg. Price</th>
                        <th className="px-4 py-3 font-medium">Mark Price</th>
                        <th className="px-4 py-3 font-medium text-right">PNL</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {positions.map((pos, idx) => {
                        const marketValue = pos.amount * pos.currentPrice;
                        const costBasis = pos.amount * pos.avgPrice;
                        const pnl = marketValue - costBasis;
                        const pnlPercent = (pnl / costBasis) * 100;

                        return (
                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                <td className="px-4 py-4 font-bold text-zinc-900 dark:text-zinc-200">
                                    <span className={`uppercase ${pos.outcome === "yes" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                        {pos.outcome}
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-mono">{pos.amount.toLocaleString()}</td>
                                <td className="px-4 py-4 font-mono">${marketValue.toFixed(2)}</td>
                                <td className="px-4 py-4 font-mono">{pos.avgPrice.toFixed(2)}¢</td>
                                <td className="px-4 py-4 font-mono text-zinc-900 dark:text-zinc-300">{pos.currentPrice.toFixed(2)}¢</td>
                                <td className={`px-4 py-4 font-mono text-right font-bold ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

