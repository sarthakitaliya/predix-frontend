"use client";
import { usePrivy } from "@privy-io/react-auth";
import { UserOpenOrders } from "./user-open-orders";

export const UserMarketTabs = ({ marketId }: { marketId: string }) => {
    // We want to show the header even if not logged in, so user knows where orders would be
    return (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h3 className="text-lg font-bold mb-4">Your Orders</h3>
            <div className="min-h-[200px]">
                <UserOpenOrders marketId={marketId} isEmbedded />
            </div>
        </div>
    );
};
