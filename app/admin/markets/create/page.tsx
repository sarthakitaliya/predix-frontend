"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/app/utils/axiosInstance";
import { usePrivy, useIdentityToken, useLogin } from "@privy-io/react-auth";

export default function CreateMarketPage() {
    const router = useRouter();
    const { ready, user, getAccessToken } = usePrivy();
    const { identityToken } = useIdentityToken();
    const { login } = useLogin();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        category: "Politics",
        endDate: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError("You must be logged in to create a market.");
            return;
        }

        try {
            setLoading(true);
            const accessToken = await getAccessToken();

            // Convert date string (YYYY-MM-DD) to Unix timestamp (seconds)
            // Setting time to 23:59:59 of that day or just taking the date at 00:00
            // The user input is just date, let's assume end of day UTC or just standard date
            const dateObj = new Date(formData.endDate);
            const expirationTimestamp = Math.floor(dateObj.getTime() / 1000);

            if (isNaN(expirationTimestamp)) {
                throw new Error("Invalid expiration date");
            }

            const body = {
                metadata: {
                    title: formData.title,
                    description: formData.description || undefined,
                    category: formData.category,
                    image_url: formData.imageUrl || undefined,
                },
                collateral_mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Hardcoded default
                expiration_timestamp: expirationTimestamp,
            };

            const { data } = await api.post(
                "/admin/market/create",
                body,
                {
                    headers: {
                        "privy-id-token": identityToken,
                    },
                }
            );

            console.log("Market created:", data);
            router.push("/admin/markets");
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || err.message || "Failed to create market");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (!ready) return <div className="p-10 text-center">Loading auth...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8 flex flex-col items-start gap-4">
                <div>
                    <Link
                        href="/admin/markets"
                        className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 inline-flex items-center transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Markets
                    </Link>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Create New Market</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                        Launch a new binary prediction market.
                    </p>
                </div>

                {!user && (
                    <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg flex items-center justify-between">
                        <span className="text-yellow-800 dark:text-yellow-200 font-medium">Authentication required</span>
                        <button
                            onClick={() => login()}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm"
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm ring-1 ring-gray-950/5 dark:ring-white/5">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded text-red-700 dark:text-red-300">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Question / Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        placeholder="e.g. Will Bitcoin hit $100k by EOY?"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Resolution Rules
                    </label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Provide specific details on how this market will be resolved.</p>
                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        placeholder="The market resolves to YES if..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                    <label htmlFor="imageUrl" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Image URL
                    </label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        placeholder="https://..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-2">
                        <label htmlFor="category" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Category
                        </label>
                        <div className="relative">
                            <select
                                id="category"
                                name="category"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all text-zinc-900 dark:text-zinc-100 appearance-none"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Politics">Politics</option>
                                <option value="Crypto">Crypto</option>
                                <option value="Sports">Sports</option>
                                <option value="Economics">Economics</option>
                                <option value="Finance">Finance</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label htmlFor="endDate" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all text-zinc-900 dark:text-zinc-100"
                            value={formData.endDate}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-4">
                    <Link
                        href="/admin/markets"
                        className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !user}
                        className="bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold px-8 py-3 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating..." : "Deploy Market"}
                    </button>
                </div>
            </form>
        </div>
    );
}
