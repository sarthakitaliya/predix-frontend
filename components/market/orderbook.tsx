"use client";

interface OrderbookProps {
    outcome: "yes" | "no";
}

export const Orderbook = ({ outcome }: OrderbookProps) => {
    // Different data for Yes vs No
    const bidsYes = [
        { price: 0.77, size: 1200 },
        { price: 0.76, size: 5400 },
        { price: 0.75, size: 1540 },
    ];
    const asksYes = [
        { price: 0.79, size: 2310 },
        { price: 0.80, size: 4120 },
        { price: 0.81, size: 890 },
    ];

    const bidsNo = [
        { price: 0.21, size: 3000 },
        { price: 0.20, size: 6200 },
        { price: 0.19, size: 2100 },
    ];
    const asksNo = [
        { price: 0.23, size: 1500 },
        { price: 0.24, size: 3400 },
        { price: 0.25, size: 900 },
    ];

    const bids = outcome === "yes" ? bidsYes : bidsNo;
    const asks = outcome === "yes" ? asksYes : asksNo;

    // Stats
    const bestBid = bids[0].price;
    const bestAsk = asks[0].price;
    const spread = bestAsk - bestBid;
    const lastPrice = outcome === "yes" ? 0.78 : 0.22;

    // Static Colors for Bids (Green) and Asks (Red)
    const bidText = "text-green-600 dark:text-green-400";
    const bidBg = "bg-green-100 dark:bg-green-900/20";
    const bidHover = "hover:bg-green-50 dark:hover:bg-green-900/10";

    const askText = "text-red-600 dark:text-red-400";
    const askBg = "bg-red-100 dark:bg-red-900/20";
    const askHover = "hover:bg-red-50 dark:hover:bg-red-900/10";

    return (
        <div className="mt-8 transition-all">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Order Book ({outcome === "yes" ? "Yes" : "No"})
                </h3>
                <div className="flex gap-4 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 py-1 px-3 rounded-md">
                    <span className="text-zinc-500">Spread: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{spread.toFixed(2)}</span></span>
                    <span className="text-zinc-300 dark:text-zinc-600">|</span>
                    <span className="text-zinc-500">Last: <span className="font-bold text-zinc-900 dark:text-white">{lastPrice}</span></span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span>Bid</span>
                        <span>Quantity</span>
                    </div>
                    <div className="space-y-1">
                        {bids.map((bid, i) => (
                            <div key={i} className={`flex justify-between text-sm font-mono relative group cursor-pointer ${bidHover} rounded px-1 -mx-1 transition-colors`}>
                                <span className={`font-bold ${bidText}`}>{bid.price.toFixed(2)}</span>
                                <span className="text-zinc-600 dark:text-zinc-400">{bid.size.toLocaleString()}</span>
                                <div className={`absolute inset-y-0 right-0 ${bidBg} opacity-0 group-hover:opacity-100 w-full -z-10 rounded`}></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span>Ask</span>
                        <span>Quantity</span>
                    </div>
                    <div className="space-y-1">
                        {asks.map((ask, i) => (
                            <div key={i} className={`flex justify-between text-sm font-mono relative group cursor-pointer ${askHover} rounded px-1 -mx-1 transition-colors`}>
                                <span className={`font-bold ${askText}`}>{ask.price.toFixed(2)}</span>
                                <span className="text-zinc-600 dark:text-zinc-400">{ask.size.toLocaleString()}</span>
                                <div className={`absolute inset-y-0 right-0 ${askBg} opacity-0 group-hover:opacity-100 w-full -z-10 rounded`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
