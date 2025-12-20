import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useUSDCStore } from "@/store/usdcStore";

export const useUSDCBalance = () => {
    const { user } = usePrivy();
    const { balance, loading, isRefreshing, fetchBalance, startRefreshing } = useUSDCStore();

    useEffect(() => {
        if (user?.wallet?.address) {
            // Initial fetch
            fetchBalance(user.wallet.address);

            // Background poll every 5s for near real-time updates (e.g. external deposits)
            const interval = setInterval(() => {
                if (user?.wallet?.address) fetchBalance(user.wallet.address);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [user?.wallet?.address]);

    return {
        balance,
        loading,
        isRefreshing,
        refetch: () => user?.wallet?.address && startRefreshing(user.wallet.address)
    };
};
