"use client";

interface PriceChartProps {
    outcome: "yes" | "no";
}

export const PriceChart = ({ outcome }: PriceChartProps) => {
    // Two different dummy paths to show change
    const pointsYes = "0,80 10,78 20,82 30,75 40,79 50,70 60,72 70,65 80,68 90,60 100,55 110,58 120,50 130,52 140,45 150,48 160,40 170,42 180,35 190,38 200,30 210,32 220,25 230,28 240,20 250,22 260,15 270,18 280,10 290,12 300,5";
    const pointsNo = "0,20 10,22 20,18 30,25 40,28 50,30 60,35 70,32 80,38 90,40 100,45 110,42 120,48 130,50 140,55 150,52 160,58 170,60 180,65 190,62 200,70 210,68 220,75 230,72 240,78 250,75 260,80 270,78 280,85 290,82 300,90";

    const points = outcome === "yes" ? pointsYes : pointsNo;
    const color = outcome === "yes" ? "#2563eb" : "#dc2626"; // Blue (Yes) or Red (No)
    const price = outcome === "yes" ? "78" : "22";

    return (
        <div className="w-full h-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 relative overflow-hidden group transition-all">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <div className="text-sm text-zinc-500 font-medium uppercase tracking-wide">{outcome === "yes" ? "Yes" : "No"} Price</div>
                    <div className={`text-3xl font-bold transition-colors ${outcome === "yes" ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>
                        {price}¢ <span className="text-sm font-normal text-zinc-400"> {outcome === "yes" ? "+2%" : "-2%"}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {["1H", "1D", "1W", "1M", "ALL"].map(pd => (
                        <button key={pd} className={`text-xs font-bold px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${pd === "1D" ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
                            {pd}
                        </button>
                    ))}
                </div>
            </div>
            <div className="relative h-40 w-full">
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                        <linearGradient id={`gradient-${outcome}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={`M0,100 L0,${outcome === 'yes' ? 80 : 20} ${points} L300,${outcome === 'yes' ? 5 : 90} L300,100 Z`} fill={`url(#gradient-${outcome})`} />
                    <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center pointer-events-none bg-white/5 dark:bg-black/5 backdrop-blur-[1px]">
                    <div className="bg-zinc-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-md transform scale-95 group-hover:scale-100 transition-transform">
                        Simulated market data for demonstration
                    </div>
                </div>
            </div>
        </div>
    );
};
