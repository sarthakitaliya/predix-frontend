"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LinkedAccount, useUserStore } from "@/store/useUserStore";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, user, authenticated } = usePrivy();
  const router = useRouter();
  const { user: storedUser, setUser } = useUserStore();

  useEffect(() => {
    if (ready && !user) {
      router.push("/login");
    }
    if (authenticated && user) {
      let linkedAccountsArray = user.linkedAccounts
        .map((account) => {
          if (account.type === "google_oauth") {
            return {
              name: account.name!,
              email: account.email!,
              type: "google_oauth",
              isAdmin: account.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
            };
          }
          if (account.type === "wallet") {
            return {
              id: account.id,
              address: account.address,
              chainType: account.chainType,
              connectorType: account.connectorType,
              type: "wallet",
            };
          }
          return null;
        })
        .filter(Boolean) as LinkedAccount[];
      const newUser = {
        id: user.id,
        linkedAccounts: linkedAccountsArray,
      };
      setUser(newUser);
    } else {
      setUser(null);
    }
  }, [ready, authenticated, user, router]);

  if (!ready || !user) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
