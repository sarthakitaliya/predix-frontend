"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import RequireAuth from "@/components/RequireAuth";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const {user} = useUserStore();
    const router = useRouter();
    useEffect(() => {
        if(user){
            let isAdmin = user.linkedAccounts.some((account) => 
                account.type === "google_oauth" && 
                account.isAdmin
            );
            if(!isAdmin){
                router.push("/login");
            }
        }
    }, [user]);
  return (
    <RequireAuth>
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
                  <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Predix Admin
                  </span>
                </Link>
                <nav className="hidden sm:flex sm:space-x-8 items-center"></nav>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                {/* Admin Profile / Logout could go here */}
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  A
                </div>
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
    </RequireAuth>
  );
}
