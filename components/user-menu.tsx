"use client";
import { useState, useRef, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

export const UserMenu = () => {
    const { user, logout } = usePrivy();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    // Derived user info from Privy User object
    const googleAccount = user.linkedAccounts.find(a => a.type === "google_oauth") as any;
    const walletAccount = user.linkedAccounts.find(a => a.type === "wallet") as any;
    const emailAccount = user.linkedAccounts.find(a => a.type === "email") as any;

    const email = googleAccount?.email || emailAccount?.address; // email type has address as email
    const address = walletAccount?.address;

    const displayName = googleAccount?.name || (address ? address.slice(0, 6) + "..." + address.slice(-4) : "User");

    // Admin check
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isAdmin = email && adminEmail && email === adminEmail;

    // Fallback for avatar letter
    const initial = googleAccount?.name?.[0] || address?.[0] || "U";

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-lg transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#07C285] to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {initial.toUpperCase()}
                </div>
                {/* Name (Desktop only) */}
                <span className="text-sm font-medium hidden md:block max-w-[120px] truncate text-zinc-700 dark:text-zinc-200">
                    {displayName}
                </span>
                {/* Chevron */}
                <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{displayName}</p>
                        {email && <p className="text-xs text-zinc-500 truncate mt-0.5">{email}</p>}
                        {!email && address && <p className="text-xs text-zinc-500 font-mono truncate mt-0.5">{address}</p>}
                    </div>

                    <div className="py-1">
                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Profile
                        </Link>
                        <Link href="/portfolio" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            Portfolio
                        </Link>
                        {isAdmin && (
                            <Link href="/admin/markets" className="flex items-center gap-2 px-4 py-2 text-sm text-[#07C285] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                Admin Dashboard
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1 mt-1">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
