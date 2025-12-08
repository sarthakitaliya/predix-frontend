"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { UserMenu } from "@/components/user-menu";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, ready } = usePrivy();
    const router = useRouter();

    useEffect(() => {
        if (!ready) return;

        const checkAdmin = () => {
            if (!user) {
                router.push("/");
                return;
            }

            const googleAccount = user.linkedAccounts.find(a => a.type === "google_oauth") as any;
            const email = googleAccount?.email;
            const isAdmin = email && email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

            if (!isAdmin) {
                router.push("/");
            }
        };

        checkAdmin();
    }, [user, ready, router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
            {/* Top Header */}
            <header className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex gap-8">
                            <Link
                                href="/admin/markets"
                                className="flex-shrink-0 flex items-center"
                            >
                                <span className="text-xl font-bold tracking-tight text-[#07C285]">
                                    Predix Admin
                                </span>
                            </Link>
                            <nav className="hidden sm:flex sm:space-x-8 items-center"></nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
