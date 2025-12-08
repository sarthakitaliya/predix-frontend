"use client";
import { useState } from "react";
import { useTrading } from "@/hooks/useTrading";
import { Market } from "@/types/market";

interface SplitMergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "split" | "merge";
    market: Market;
}

export const SplitMergeModal = ({ isOpen, onClose, type, market }: SplitMergeModalProps) => {
    const [amount, setAmount] = useState("");
    const { placeOrder, loading } = useTrading();

    if (!isOpen) return null;

    const handleConfirm = async () => {
        const success = await placeOrder({
            market,
            action: "buy", // Placeholder, validated as irrelevant for split/merge in hook
            outcome: "yes", // Placeholder
            orderType: type,
            amount: amount,
            limitPrice: 0 // Placeholder
        });

        if (success) {
            setAmount("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 capitalize">{type} Position</h3>
                    <p className="text-sm text-zinc-500 mb-6">
                        {type === "split"
                            ? "Split your collateral into Yes and No tokens."
                            : "Merge your Yes and No tokens back into collateral."}
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase">Amount (USDC)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-black dark:focus:border-white outline-none font-mono font-bold text-lg"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!amount || loading}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Processing..." : `Confirm ${type === "split" ? "Split" : "Merge"}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
