"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import axios from "axios";
import { usePrivy } from "@privy-io/react-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { PriceChart } from "@/components/market/price-chart";
import { Orderbook } from "@/components/market/orderbook";
import { Market } from "@/types/market";
import { useTrading } from "@/hooks/useTrading";
import { UserMenu } from "@/components/user-menu";
import { SplitMergeModal } from "@/components/market/split-merge-modal";
import { UserMarketTabs } from "@/components/market/user-market-tabs";
import { useParams } from "next/navigation";

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { user, login } = usePrivy();
  const { placeOrder, loading: tradeLoading } = useTrading();

  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trading State
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [outcome, setOutcome] = useState<"yes" | "no">("yes");
  const [orderType, setOrderType] = useState<
    "market" | "limit" | "split" | "merge"
  >("market");
  const [amount, setAmount] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<number>(0.5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<{ market: Market }>(
          `http://localhost:3030/markets/${id}`
        );

        if (data.market) {
          setMarket(data.market);
        } else {
          setError("Market not found");
        }
      } catch (err: any) {
        console.error("Error fetching market:", err);
        setError("Failed to load market");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMarket();
    }
  }, [id]);

  const handlePlaceOrder = async () => {
    if (market) {
      const success = await placeOrder({
        market,
        action,
        outcome,
        orderType,
        amount,
        limitPrice,
      });
      if (success) {
        setAmount("");
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="space-y-4 p-8 max-w-7xl mx-auto">
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl"></div>
      </div>
    );
  if (!market)
    return (
      <div className="p-20 text-center text-red-500">Market not found.</div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#07C285] hover:text-[#06a874] transition-colors py-2"
          >
            <span className="font-bold text-lg">Predix</span>
          </Link>
          <div className="flex items-center gap-4">
            {!user && <ThemeToggle />}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={login}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 font-bold text-sm transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={login}
                  className="bg-[#07C285] hover:bg-[#06a874] text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            ) : (
              <UserMenu />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN: Content (8/12) */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex gap-6 items-start">
              {market.image_url && (
                <img
                  src={market.image_url}
                  alt={market.title}
                  className="w-20 h-20 rounded-full object-cover shadow-sm hidden md:block"
                />
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                  {market.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span>Ends {formatDate(market.close_time)}</span>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                  <span>${market.volume || "0"} Volume</span>
                </div>
              </div>
            </div>

            {/* Pass outcome prop to drive dynamic data */}
            <PriceChart outcome={outcome} />

            {/* Pass outcome prop to drive dynamic data */}
            <Orderbook outcome={outcome} marketId={market.market_id} />

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <h3 className="text-lg font-bold mb-4">Market Rules</h3>
              <div className="prose dark:prose-invert prose-zinc max-w-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {market.description ||
                  "No specific details provided for this market."}
              </div>
            </div>

            <UserMarketTabs marketId={market.market_id} />
          </div>

          {/* RIGHT COLUMN: Trading Panel (4/12) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                {market.image_url && (
                  <img
                    src={market.image_url}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="text-xs font-bold text-zinc-400">
                    {action === "buy" ? "Buying" : "Selling"}{" "}
                    {outcome === "yes" ? "Yes" : "No"}
                  </div>
                  <div className="font-bold leading-tight">
                    {market.title.slice(0, 40)}...
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/30 overflow-hidden">
                {/* Row 1: Action + Order Type */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                    <button
                      onClick={() => setAction("buy")}
                      className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        action === "buy"
                          ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setAction("sell")}
                      className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        action === "sell"
                          ? "bg-red-500 text-white shadow-sm shadow-red-500/30"
                          : "text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  <div className="relative group">
                    <button className="text-xs font-bold flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                      {orderType === "market"
                        ? "Market Order"
                        : orderType === "limit"
                        ? "Limit Order"
                        : orderType === "split"
                        ? "Split Order"
                        : "Merge Order"}
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-1">
                      <button
                        onClick={() => setOrderType("market")}
                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md cursor-pointer"
                      >
                        Market Order
                      </button>
                      <button
                        onClick={() => setOrderType("limit")}
                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md cursor-pointer"
                      >
                        Limit Order
                      </button>
                      <button
                        onClick={() => {
                          setOrderType("split");
                          setIsModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md cursor-pointer"
                      >
                        Split Order
                      </button>
                      <button
                        onClick={() => {
                          setOrderType("merge");
                          setIsModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md cursor-pointer"
                      >
                        Merge Order
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Outcomes */}
                <div className="grid grid-cols-2 p-4 gap-3">
                  <button
                    onClick={() => setOutcome("yes")}
                    className={`flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all cursor-pointer ${
                      outcome === "yes"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-transparent bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        outcome === "yes"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      Yes
                    </span>
                    <span
                      className={`text-lg font-black ${
                        outcome === "yes"
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-zinc-900 dark:text-zinc-200"
                      }`}
                    >
                      78¢
                    </span>
                  </button>
                  <button
                    onClick={() => setOutcome("no")}
                    className={`flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all cursor-pointer ${
                      outcome === "no"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-transparent bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        outcome === "no"
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      No
                    </span>
                    <span
                      className={`text-lg font-black ${
                        outcome === "no"
                          ? "text-red-700 dark:text-red-300"
                          : "text-zinc-900 dark:text-zinc-200"
                      }`}
                    >
                      22¢
                    </span>
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* Stepper Input for Limit Price */}
                  {orderType === "limit" && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase">
                          Limit Price
                        </label>
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                          <button
                            onClick={() =>
                              setLimitPrice((p) =>
                                Math.max(
                                  0.001,
                                  parseFloat((Number(p) - 0.01).toFixed(3))
                                )
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors text-zinc-500 cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 12H4"
                              ></path>
                            </svg>
                          </button>
                          <div className="flex items-center justify-center relative w-16">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={
                                limitPrice
                                  ? parseFloat((limitPrice * 100).toFixed(1))
                                  : ""
                              }
                              onChange={(e) => {
                                let val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  // Smart Decimal Shift for rapid entry (e.g. 111 -> 11.1)
                                  if (val >= 100) {
                                    val = val / 10;
                                  }
                                  // Strict Maximum Enforcement
                                  if (val > 99.9) val = 99.9;
                                  if (val < 0) val = 0;

                                  setLimitPrice(val / 100);
                                } else if (e.target.value === "") {
                                  setLimitPrice(0);
                                }
                              }}
                              className="w-full text-center font-mono font-bold bg-transparent outline-none text-zinc-900 dark:text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 z-10"
                            />
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs pointer-events-none">
                              ¢
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setLimitPrice((p) =>
                                Math.min(
                                  1.0,
                                  parseFloat((Number(p) + 0.01).toFixed(3))
                                )
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors text-zinc-500 cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">
                      {orderType === "limit" || action === "sell"
                        ? "Shares"
                        : "Amount"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-4 text-3xl font-bold bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-colors"
                      />
                      {orderType === "market" && action === "buy" && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 font-bold pr-2">
                          USDC
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Average price</span>
                      <span className="font-mono font-bold">
                        {orderType === "limit"
                          ? limitPrice.toFixed(2)
                          : outcome === "yes"
                          ? "0.78"
                          : "0.22"}
                        ¢
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Estimated cost</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white">
                        {amount
                          ? `$${(orderType === "market" && action === "buy"
                              ? parseFloat(amount)
                              : parseFloat(amount) *
                                (orderType === "limit"
                                  ? limitPrice
                                  : outcome === "yes"
                                  ? 0.78
                                  : 0.22)
                            ).toFixed(2)}`
                          : "$0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">
                        Payout if {outcome === "yes" ? "Yes" : "No"}
                      </span>
                      <span className="font-mono font-bold text-green-600 dark:text-green-400">
                        {action === "buy"
                          ? amount
                            ? `$${(orderType === "market" && action === "buy"
                                ? parseFloat(amount) /
                                  (outcome === "yes" ? 0.78 : 0.22)
                                : parseFloat(amount)
                              ).toFixed(2)}`
                            : "$0.00"
                          : "N/A (Selling)"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={tradeLoading || !user || !amount}
                    className={`w-full py-3.5 rounded-lg font-bold text-base shadow-lg transition-all transform active:scale-[0.98] mt-2 cursor-pointer ${
                      !user
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                        : tradeLoading
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 animate-pulse cursor-wait"
                        : action === "sell"
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                        : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
                    }`}
                  >
                    {!user
                      ? "Log in to Trade"
                      : tradeLoading
                      ? "Processing..."
                      : `${action === "buy" ? "Buy" : "Sell"} ${
                          outcome === "yes" ? "Yes" : "No"
                        }`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <SplitMergeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setOrderType("market");
          }}
          type={orderType as "split" | "merge"}
          market={market}
        />
      </main>
    </div>
  );
}
