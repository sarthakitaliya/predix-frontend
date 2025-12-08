"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { usePrivy } from "@privy-io/react-auth";
import { Market } from "@/types/market";

interface MarketsResponse {
  markets: Market[];
}

export default function Home() {
  const { user, login } = usePrivy();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<MarketsResponse>("http://localhost:3030/markets?status=open");
        setMarkets(data.markets || []);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Predefined categories from Admin Create Page + 'All'
  const categories = ["All", "Politics", "Crypto", "Sports", "Economics", "Finance"];
  const filteredMarkets = selectedCategory === "All" ? markets : markets.filter(m => (m.category || "General") === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-[#07C285]">
              Predix
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="/" className="text-zinc-900 dark:text-white">Markets</Link>
              <Link href="/profile" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">Portfolio</Link>
              <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">Leaderboard</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={login}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-2 font-bold text-sm transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={login}
                  className="bg-[#07C285] hover:bg-[#06a874] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Open Markets</h2>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 py-2.5 pl-4 pr-10 rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow cursor-pointer shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500 dark:text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Market Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center p-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-zinc-500">No open markets found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <Link href={`/markets/${market.market_id}`} key={market.id} className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      {market.image_url ? (
                        <img src={market.image_url} alt={market.title} className="w-12 h-12 rounded-full object-cover shadow-sm bg-zinc-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm flex items-center justify-center text-white font-bold text-xl">
                          {market.title.charAt(0)}
                        </div>
                      )}
                      <div>
                        {/* Tags */}
                        <div className="flex gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {market.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-[#07C285] transition-colors">{market.title}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Yes 78¢</span>
                    <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">No 22¢</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Vol. ${market.volume || "0"}</span>
                    <span>Ends {formatDate(market.close_time)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
