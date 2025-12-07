"use client";
import {
  usePrivy,
  useSessionSigners,
  type WalletWithMetadata,
  useLogin,
  useIdentityToken,
} from "@privy-io/react-auth";
import {
  type ConnectedStandardSolanaWallet,
  useWallets,
  useSignAndSendTransaction,
  useSignTransaction,
  useExportWallet,
} from "@privy-io/react-auth/solana";
import axios from "axios";
import { useEffect, useState } from "react";
import api from "./utils/axiosInstance";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUserStore } from "@/store/useUserStore";

interface DelegateInfo {
  usdc?: {
    delegate: string;
    amount: number;
  };
  yesToken?: {
    delegate: string;
    amount: number;
  };
  noToken?: {
    delegate: string;
    amount: number;
  };
}
export default function Home() {
  const { ready, user, logout, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { identityToken } = useIdentityToken();
  const { getAccessToken } = usePrivy();
  const [solanaAddress, setSolanaAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
  const selectedWallet = wallets[0];
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const [delegateInfo, setDelegateInfo] = useState<DelegateInfo | null>(null);
  const [side, setSide] = useState<"buy" | "sell" | null>(null);
  const { exportWallet } = useExportWallet();
  const { login } = useLogin();
  const { user: currentUser } = useUserStore();
  const marketId = "12196742119703774450"; // example market id

  useEffect(() => {
    if (currentUser) {
      const solWallet = currentUser.linkedAccounts.find(
        (account) =>
          account.type === "wallet" &&
          account.chainType === "solana"
      );
      console.log("wallet", solWallet);
      
      if(solWallet) {
        console.log(solWallet.type == "wallet" ? solWallet.address : "ooooo");
        
        setSolanaAddress(solWallet.type === "wallet" ? solWallet.address : "");
      }
    }
  }, [ready, authenticated, currentUser]);
  const exportWalletData = async () => {
    const isAuthenticated = ready && authenticated;
    if (!isAuthenticated) {
      console.log("User is not authenticated");
      return;
    }
    if (!user) {
      console.log("No user found");
      return;
    }
    const hasEmbeddedWallet = !!user.linkedAccounts.find(
      (account): account is WalletWithMetadata =>
        account.type === "wallet" &&
        account.walletClientType === "privy" &&
        account.chainType === "solana"
    );
    if (hasEmbeddedWallet) {
      await exportWallet({
        address: solanaAddress,
      });
    }
  };

  async function delegate() {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      //add body data
      const body = {
        market_id: marketId,
        side: "Bid",
        share: "No",
        amount: 1000000,
        decimals: 6,
      };
      const { data } = await axios.post(
        "http://localhost:3030/orderbook/approve",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      console.log(data);
      console.log(solanaAddress);
      const raw = Buffer.from(data.tx_message, "base64");
      console.log("raw", raw);
      //convert tx to uint8array
      const txUint8Array = new Uint8Array(raw);
      const txSignature = await signAndSendTransaction({
        transaction: txUint8Array,
        wallet: selectedWallet!,
        chain: "solana:devnet",
      });
      console.log("txSignature", txSignature);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function delegateYesToken() {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      //add body data
      const body = {
        market_id: marketId,
        side: "Ask",
        share: "Yes",
        amount: 1000000,
        decimals: 6,
      };
      const { data } = await axios.post(
        "http://localhost:3030/orderbook/approve",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      console.log(data);
      console.log(solanaAddress);
      const raw = Buffer.from(data.tx_message, "base64");
      console.log("raw", raw);
      //convert tx to uint8array
      const txUint8Array = new Uint8Array(raw);
      const txSignature = await signAndSendTransaction({
        transaction: txUint8Array,
        wallet: selectedWallet!,
        chain: "solana:devnet",
      });
      console.log("txSignature", txSignature);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }
  async function delegateNoToken() {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      //add body data
      const body = {
        market_id: marketId,
        side: "Ask",
        share: "No",
        amount: 1000000,
        decimals: 6,
      };
      const { data } = await axios.post(
        "http://localhost:3030/orderbook/approve",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      console.log(data);
      console.log(solanaAddress);
      const raw = Buffer.from(data.tx_message, "base64");
      console.log("raw", raw);
      //convert tx to uint8array
      const txUint8Array = new Uint8Array(raw);
      const txSignature = await signAndSendTransaction({
        transaction: txUint8Array,
        wallet: selectedWallet!,
        chain: "solana:devnet",
      });
      console.log("txSignature", txSignature);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }
  async function check() {
    try {
      const usdcMint = new PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
      );
      const solAddress = new PublicKey(solanaAddress);
      const userUsdcAta = await getAssociatedTokenAddress(usdcMint, solAddress);
      console.log("userUsdcAta", userUsdcAta.toBase58());
      const getUsdcInfo = await getAccount(connection, userUsdcAta);
      console.log("getUsdcInfo", getUsdcInfo.amount);
      setDelegateInfo({
        usdc: {
          delegate: getUsdcInfo.delegate?.toBase58() || "No delegate",
          amount: Number(getUsdcInfo.delegatedAmount),
        },
      });
      const accessToken = await getAccessToken();
      //add body data
      const body = {
        market_id: marketId,
        collateral_mint: usdcMint.toBase58(),
      };
      const { data } = await axios.post(
        "http://localhost:3030/orderbook/check",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function checkToken() {
    try {
      const accessToken = await getAccessToken();
      const yesMint = new PublicKey(
        "5hwhLqPFHbBn93mG5zhvADpPq9wb3kdUD1skXfg3cMUw"
      );
      const noMint = new PublicKey(
        "8PmA1bBJSn5FWdc12B2BFxsnjMjWW6Tfz3JV12KWoB2T"
      );
      const solAddress = new PublicKey(solanaAddress);
      const userYesAta = await getAssociatedTokenAddress(yesMint, solAddress);
      const userNoAta = await getAssociatedTokenAddress(noMint, solAddress);
      const getYesInfo = await getAccount(connection, userYesAta);
      const getNoInfo = await getAccount(connection, userNoAta);
      console.log("getYesInfo", getYesInfo.amount);
      console.log("getNoInfo", getNoInfo.amount);
      const bodyYes = {
        market_id: marketId,
        collateral_mint: yesMint.toBase58(),
      };
      const yesCheck = axios.post(
        "http://localhost:3030/orderbook/check",
        bodyYes,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      const bodyNo = {
        market_id: marketId,
        collateral_mint: noMint.toBase58(),
      };
      const noCheck = axios.post(
        "http://localhost:3030/orderbook/check",
        bodyNo,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      const [yesData, noData] = await Promise.all([yesCheck, noCheck]);
      console.log("yesData", yesData.data);
      console.log("noData", noData.data);
      setDelegateInfo({
        yesToken: {
          delegate: getYesInfo.delegate?.toBase58() || "No delegate",
          amount: Number(getYesInfo.delegatedAmount),
        },
        noToken: {
          delegate: getNoInfo.delegate?.toBase58() || "No delegate",
          amount: Number(getNoInfo.delegatedAmount),
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  async function splitOrder() {
    try {
      const accessToken = await getAccessToken();
      //add body data amount 1 USDC
      const body = {
        market_id: marketId,
        collateral_mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        amount: 1000000,
        b: 2,
      };
      console.log("body", body);

      //derive yes_mint no_mint from seeds
      //  let [yesMint, yesBump] = PublicKey.findProgramAddressSync(
      //   [Buffer.from("yes_mint"), Buffer.from(marketId.toString())],
      //   new PublicKey("2FoSgViaZXUXL8txXYxc893cUSpPCuvdVZBJ9YDzUKzE")
      // );
      //   console.log("yes_mint", yesMint.toBase58());

      //   const yes_ata = getOrCreateAssociatedTokenAccount
      const { data } = await axios.post(
        "http://localhost:3030/orderbook/split-order",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      console.log(data);
      const raw = Buffer.from(data.tx_message, "base64");
      //convert tx to uint8array
      const txUint8Array = new Uint8Array(raw);
      const txSignature = await signAndSendTransaction({
        transaction: txUint8Array,
        wallet: selectedWallet!,
        chain: "solana:devnet",
      });
      console.log("txSignature", txSignature);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function mergeOrder() {
    try {
      const accessToken = await getAccessToken();
      //add body data amount 1 USDC
      const body = {
        market_id: marketId,
        collateral_mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        amount: 1000000,
      };
      //derive yes_mint no_mint from seeds
      //  let [yesMint, yesBump] = PublicKey.findProgramAddressSync(
      //   [Buffer.from("yes_mint"), Buffer.from(marketId.toString())],
      //   new PublicKey("2FoSgViaZXUXL8txXYxc893cUSpPCuvdVZBJ9YDzUKzE")
      // );
      //   console.log("yes_mint", yesMint.toBase58());

      //   const yes_ata = getOrCreateAssociatedTokenAccount
      const { data } = await axios.post(
        "http://localhost:3030/orderbook/merge-order",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      console.log(data);
      const raw = Buffer.from(data.tx_message, "base64");
      //convert tx to uint8array
      const txUint8Array = new Uint8Array(raw);
      const txSignature = await signAndSendTransaction({
        transaction: txUint8Array,
        wallet: selectedWallet!,
        chain: "solana:devnet",
      });
      console.log("txSignature", txSignature);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function placeOrder() {
    try {
      const accessToken = await getAccessToken();
      // decide side buy or sell based on button clicked
      const sideValue = side === "buy" ? "Bid" : "Ask";
      console.log(side);

      const body = {
        market_id: marketId,
        collateral_mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        side: sideValue,
        share: "No",
        price: 1.0,
        qty: 1,
      };

      const { data } = await axios.post(
        "http://localhost:3030/orderbook/place-order",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "privy-id-token": identityToken,
          },
          // withCredentials: true,
        }
      );
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  if (!ready) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div>
        {wallets.map((wallet: ConnectedStandardSolanaWallet) => (
          <div key={wallet.address}>
            <img src={wallet.standardWallet.icon} width={16} height={16} />
            <span>{wallet.standardWallet.name}</span>
            <br />
            <code>{wallet.address}</code>
            <button
              onClick={async () => {
                const message = new TextEncoder().encode("Hello, world!");
                const { signature } = await wallet.signMessage({ message });
                console.log("signature", signature);
              }}
            >
              Sign message
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => login()}
        className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
      >
        Login with Privy
      </button>
      {/* <button
        onClick={onSendTransaction}
        className="mb-3 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        Send Transaction
      </button> */}
      <button
        onClick={() => logout()}
        className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
      >
        Logout
      </button>
      <div className="flex">
        <button
          onClick={delegateYesToken}
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          Delegate Yes token
        </button>
        <button
          onClick={delegateNoToken}
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          Delegate No token
        </button>
        <button
          onClick={delegate}
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          Delegate USDC
        </button>
      </div>
      <div className="flex">
        <button
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
          onClick={check}
        >
          Check
        </button>
        <button
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
          onClick={checkToken}
        >
          Check Token
        </button>
      </div>
      <div className="text-center">
        <h1 className="font-bold text-2xl">Yes token</h1>
        <button
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
          onClick={() => {
            setSide("buy");
            placeOrder();
          }}
        >
          Place Order buy
        </button>
        <button
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
          onClick={() => {
            setSide("sell");
            placeOrder();
          }}
        >
          Place Order sell
        </button>
      </div>
      <div className="flex">
        <button
          onClick={splitOrder}
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          Split Order
        </button>
        <button
          onClick={mergeOrder}
          className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          Merge Order
        </button>
      </div>
      <button
        onClick={exportWalletData}
        className="mb-3 rounded-full bg-zinc-200 dark:bg-zinc-800 px-10 py-3 font-semibold no-underline transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
      >
        Export Wallet
      </button>
      {delegateInfo && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Delegate Info:</h2>
          {delegateInfo.usdc && (
            <div className="mb-4">
              <h3 className="text-md font-semibold">USDC:</h3>
              <p>Delegate: {delegateInfo.usdc.delegate}</p>
              <p>Amount: {delegateInfo.usdc.amount}</p>
            </div>
          )}
          {delegateInfo.yesToken && (
            <div className="mb-4">
              <h3 className="text-md font-semibold">Yes Token:</h3>
              <p>Delegate: {delegateInfo.yesToken.delegate}</p>
              <p>Amount: {delegateInfo.yesToken.amount}</p>
            </div>
          )}
          {delegateInfo.noToken && (
            <div className="mb-4">
              <h3 className="text-md font-semibold">No Token:</h3>
              <p>Delegate: {delegateInfo.noToken.delegate}</p>
              <p>Amount: {delegateInfo.noToken.amount}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
