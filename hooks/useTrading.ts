import { usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import axios from "axios";
import { useState } from "react";
import { Market } from "@/types/market";
import { toast } from "sonner";

interface TradeParams {
    market: Market;
    action: "buy" | "sell";
    outcome: "yes" | "no";
    orderType: "market" | "limit" | "split" | "merge";
    amount: string;
    limitPrice: number;
}

export const useTrading = () => {
    const { user, getAccessToken } = usePrivy();
    const { identityToken } = useIdentityToken();
    const { wallets } = useWallets();
    const { signAndSendTransaction } = useSignAndSendTransaction();
    const [loading, setLoading] = useState(false);

    const placeOrder = async ({
        market,
        action,
        outcome,
        orderType,
        amount,
        limitPrice,
    }: TradeParams) => {
        if (!user || !amount || parseFloat(amount) <= 0 || !market) return;

        const selectedWallet = wallets[0];
        if (!selectedWallet) {
            toast.error("No wallet connected");
            return;
        }

        setLoading(true);
        const accessToken = await getAccessToken();
        const usdcMint = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

        try {
            if (orderType === "split") {
                const body = {
                    market_id: market.market_id,
                    collateral_mint: usdcMint,
                    amount: Math.floor(parseFloat(amount) * 1_000_000),
                };

                const { data } = await axios.post(
                    "http://localhost:3030/orders/split",
                    body,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                            "privy-id-token": identityToken,
                        },
                    }
                );

                const raw = Buffer.from(data.tx_message, "base64");
                await signAndSendTransaction({
                    transaction: new Uint8Array(raw),
                    wallet: selectedWallet,
                    chain: "solana:devnet",
                });
                toast.success("Split Order Initialized Successfully!");
                return true;

            } else if (orderType === "merge") {
                const body = {
                    market_id: market.market_id,
                    collateral_mint: usdcMint,
                    amount: Math.floor(parseFloat(amount) * 1_000_000),
                };

                const { data } = await axios.post(
                    "http://localhost:3030/orders/merge",
                    body,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                            "privy-id-token": identityToken,
                        },
                    }
                );

                const raw = Buffer.from(data.tx_message, "base64");
                await signAndSendTransaction({
                    transaction: new Uint8Array(raw),
                    wallet: selectedWallet,
                    chain: "solana:devnet",
                });
                toast.success("Merge Order Initialized Successfully!");
                return true;

            } else {
                // Existing Market/Limit Order Logic
                const val = parseFloat(amount);
                const price = orderType === "limit" ? limitPrice : (outcome === "yes" ? 0.78 : 0.22);

                let shares = 0;
                let usdcNeeded = 0;

                if (orderType === "market" && action === "buy") {
                    usdcNeeded = val;
                    shares = val / price;
                } else {
                    shares = val;
                    usdcNeeded = val * price;
                }

                // 1. Delegate
                let delegateAmount = 0;
                if (action === "buy") {
                    delegateAmount = usdcNeeded * 1_000_000;
                } else {
                    delegateAmount = shares * 1_000_000;
                }

                const delegateBody = {
                    market_id: market.market_id,
                    side: action === "buy" ? "Bid" : "Ask",
                    share: outcome,
                    amount: delegateAmount,
                    decimals: 6, // Should this be derived or fixed? Limit/Market logic
                };

                const { data: approveData } = await axios.post(
                    "http://localhost:3030/markets/delegate",
                    delegateBody,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                            "privy-id-token": identityToken,
                        },
                    }
                );

                const approveRaw = Buffer.from(approveData.tx_message, "base64");
                const approveTx = new Uint8Array(approveRaw);
                await signAndSendTransaction({
                    transaction: approveTx,
                    wallet: selectedWallet,
                    chain: "solana:devnet",
                });

                // 2. Place Order
                const orderBody = {
                    market_id: market.market_id,
                    collateral_mint: usdcMint,
                    side: action === "buy" ? "Bid" : "Ask",
                    share: outcome === "yes" ? "Yes" : "No",
                    price: price,
                    qty: shares,
                };

                const { data: orderData } = await axios.post(
                    "http://localhost:3030/orders/place",
                    orderBody,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                            "privy-id-token": identityToken,
                        },
                    }
                );
                console.log("Order placed:", orderData);
                toast.success("Order Placed Successfully!");
                return true;
            }
        } catch (err: any) {
            console.error("Trade error:", err);
            toast.error("Trade failed: " + (err.message || "Unknown error"));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        placeOrder,
        loading,
    };
};
