"use client";
import { usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/app/utils/axiosInstance";

interface OpenOrder {
    id: string;
    market_id: string;
    outcome: string;
    side: "Bid" | "Ask";
    price: number | string;
    quantity: number | string;
}

export const UserOpenOrders = ({ marketId, isEmbedded = false }: { marketId: string, isEmbedded?: boolean }) => {
    const { user, getAccessToken } = usePrivy();
    const { identityToken } = useIdentityToken();

    const [orders, setOrders] = useState<OpenOrder[]>([]);
    const [loading, setLoading] = useState(false);

    const safeFloat = (val: string | number) => typeof val === 'string' ? parseFloat(val) : val;

    useEffect(() => {
        const fetchOpenOrders = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const accessToken = await getAccessToken();
                const { data } = await api.get<OpenOrder[]>(`/orderbook/open/${marketId}`, {
                    headers: {
                        "privy-id-token": identityToken,
                    }
                });
                setOrders(data || []);
            } catch (err) {
                console.error("Error fetching open orders:", err);
                // toast.error("Failed to load open orders");
            } finally {
                setLoading(false);
            }
        };

        if (marketId && user) {
            fetchOpenOrders();
            const interval = setInterval(fetchOpenOrders, 2000); // 2s polling for updates
            return () => clearInterval(interval);
        }
    }, [marketId, user, getAccessToken, identityToken]);

    const handleCancel = async (order: OpenOrder) => {
        if (!user) return;

        const toastId = toast.loading("Cancelling order...");
        try {
            const accessToken = await getAccessToken();
            const body = {
                market_id: order.market_id,
                order_id: order.id,
                side: order.side,
                share: order.outcome,
                price: order.price
            };

            await api.delete(
                `/orders/cancel/${order.id}`,
                {
                    headers: {
                        "privy-id-token": identityToken,
                    },
                    data: body
                }
            );

            toast.success("Order cancelled", { id: toastId });
            // Optimistic update or refetch
            setOrders(prev => prev.filter(o => o.id !== order.id));
        } catch (err: any) {
            console.error("Failed to cancel order:", err);
            toast.error(err.response?.data?.message || "Failed to cancel order", { id: toastId });
        }
    };

    if (!user) return null;

    if (orders.length === 0 && !loading) {
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
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        {/* <th className="px-4 py-3 font-medium">Filled</th> */}
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                            <td className="px-4 py-4 font-bold">
                                <span className={`uppercase ${order.side === "Bid" ? "text-green-600" : "text-red-600"}`}>
                                    {order.side === "Bid" ? "Buy" : "Sell"}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${order.outcome?.toLowerCase() === "yes"
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    }`}>
                                    {order.outcome}
                                </span>
                            </td>
                            <td className="px-4 py-4 font-mono">{safeFloat(order.price).toFixed(2)}¢</td>
                            <td className="px-4 py-4 font-mono">{safeFloat(order.quantity).toLocaleString()}</td>
                            {/* <td className="px-4 py-4 font-mono text-zinc-400 dark:text-zinc-500">
                                {((order.filled / order.amount) * 100).toFixed(0)}%
                            </td> */}
                            <td className="px-4 py-4 text-right">
                                <button
                                    onClick={() => handleCancel(order)}
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

