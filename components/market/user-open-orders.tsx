"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { toast } from "sonner";

interface Order {
    id: string;
    outcome: "yes" | "no";
    side: "buy" | "sell";
    price: number;
    amount: number;
    filled: number;
}

export const UserOpenOrders = ({ marketId, isEmbedded = false }: { marketId: string, isEmbedded?: boolean }) => {
    const { user } = usePrivy();

    // Placeholder - Replace with API call
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const handleCancel = async (orderId: string) => {
        // Implement cancel logic
        toast.info("Cancelling order...");
        // await cancelOrder(orderId);
        toast.success("Order cancelled");
    };

    if (!user) return null;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 dark:text-zinc-600">
                <p>No open orders</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-zinc-500 dark:text-zinc-400">
                <thead className="text-xs uppercase border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
                    <tr>
                        <th className="px-4 py-3 font-medium">Side</th>
                        <th className="px-4 py-3 font-medium">Outcome</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Filled</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                            <td className="px-4 py-4 font-bold">
                                <span className={`uppercase ${order.side === "buy" ? "text-green-600" : "text-red-600"}`}>
                                    {order.side}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${order.outcome === "yes"
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    }`}>
                                    {order.outcome}
                                </span>
                            </td>
                            <td className="px-4 py-4 font-mono">{order.price.toFixed(2)}¢</td>
                            <td className="px-4 py-4 font-mono">{order.amount.toLocaleString()}</td>
                            <td className="px-4 py-4 font-mono text-zinc-400 dark:text-zinc-500">
                                {((order.filled / order.amount) * 100).toFixed(0)}%
                            </td>
                            <td className="px-4 py-4 text-right">
                                <button
                                    onClick={() => handleCancel(order.id)}
                                    className="text-xs font-bold text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

