import { create } from 'zustand';
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError } from "@solana/spl-token";

interface USDCState {
    balance: string;
    loading: boolean;
    isRefreshing: boolean; // For animation
    fetchBalance: (walletAddress: string) => Promise<void>;
    startRefreshing: (walletAddress: string) => void;
}

const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export const useUSDCStore = create<USDCState>((set, get) => ({
    balance: "0.00",
    loading: false,
    isRefreshing: false,

    fetchBalance: async (walletAddress: string) => {
        if (!walletAddress) return;

        try {
            // Only set global loading on first fetch if we want to show a spinner, 
            // but for balance updates usually silent is better or specific loading state.
            // We'll keep loading for initial load.
            // set({ loading: true }); 

            const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com');
            const walletPublicKey = new PublicKey(walletAddress);
            const usdcMintKey = new PublicKey(USDC_MINT);

            const associatedTokenAddress = await getAssociatedTokenAddress(
                usdcMintKey,
                walletPublicKey
            );

            try {
                const account = await getAccount(connection, associatedTokenAddress);
                const bal = Number(account.amount) / 1_000_000;
                set({ balance: bal.toFixed(2) });
            } catch (e: any) {
                if (e instanceof TokenAccountNotFoundError || e?.name === "TokenAccountNotFoundError") {
                    set({ balance: "0.00" });
                } else {
                    console.error("Error fetching token account:", e);
                }
            }
        } catch (error) {
            console.error("Error fetching USDC balance:", error);
            set({ balance: "0.00" });
        } finally {
            set({ loading: false });
        }
    },

    startRefreshing: (walletAddress: string) => {
        set({ isRefreshing: true });
        const { fetchBalance } = get();

        // Immediate fetch
        fetchBalance(walletAddress);

        // Poll at 2, 4, 6, 8, 10 seconds
        const delays = [2000, 4000, 6000, 8000, 10000];

        delays.forEach((delay, index) => {
            setTimeout(() => {
                fetchBalance(walletAddress);
                // Turn off refreshing animation after the last poll
                if (index === delays.length - 1) {
                    set({ isRefreshing: false });
                }
            }, delay);
        });
    }
}));
