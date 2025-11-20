"use client";
import {
  usePrivy,
  useSignMessage,
  useSessionSigners,
  type WalletWithMetadata,
  useLogin,
  useIdentityToken,
  useSendTransaction,
} from "@privy-io/react-auth";
import {
  type ConnectedStandardSolanaWallet,
  useWallets,
  useFundWallet as useFundSolanaWallet,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import axios from "axios";
import { useEffect, useState } from "react";
import api from "./utils/axiosInstance";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import base64 from "base64-js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

interface DelegateInfo{
  delegate: string;
  amount: number;
}
export default function Home() {
  const { ready, user, signMessage, logout } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const { fundWallet } = useFundSolanaWallet();
  const { addSessionSigners } = useSessionSigners();
  const { identityToken } = useIdentityToken();
  const { getAccessToken } = usePrivy();
  const [solanaAddress, setSolanaAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
  const selectedWallet = wallets[0];
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const [delegateInfo, setDelegateInfo] = useState<DelegateInfo | null>(null);

  const { login } = useLogin({
    onComplete: async () => {
      console.log(user?.linkedAccounts);

      const solanaWallet = user?.linkedAccounts.filter(
        (account): account is WalletWithMetadata => {
          console.log(account);
          return (
            account.type === "wallet" &&
            account.chainType === "solana" &&
            account.connectorType === "embedded"
          );
        }
      );
      console.log(solanaWallet);

      if (solanaWallet) {
        // await addSessionSigners({
        //   address: solanaWallet[0]?.address!,
        //   signers: [
        //     {
        //       signerId: process.env.NEXT_PUBLIC_PRIVY_SIGNER_ID!,
        //       policyIds: [],
        //     },
        //   ],
        // });
        console.log("asdwdfafsfwda", solanaWallet[0]?.address);
        setSolanaAddress(solanaWallet[0]?.address);
      } else {
        console.log("bo aaaa");
      }
      // console.log("token", identityToken);

      console.log(
        "Execute any logic you'd like to run after a user logs in, such as adding a session signer"
      );
    },
  });
  const onSendTransaction = async () => {
    // sendTransaction({
    //   to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C",
    //   value: 100000,
    // });

    const message = "Test message from Privy SDK";
    const signature = await signMessage({ message });
    console.log("Signature:", signature);
  };

  const delegatedWallet = user?.linkedAccounts.filter(
    (account): account is WalletWithMetadata =>
      account.type === "wallet" && account.delegated
  );
  console.log(delegatedWallet);
  async function placeOrder() {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      //add body data
      const usdcMint = new PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
      );
      const solAddress = new PublicKey(solanaAddress);
      const userAta = await getAssociatedTokenAddress(usdcMint, solAddress);
      console.log("userAta", userAta.toBase58());
      const getInfo = await getAccount(connection, userAta);
      console.log("getInfo", getInfo.amount);
      const body = {
        market_id: "solana-devnet",
        mint: usdcMint.toBase58(),
        user_ata: userAta.toBase58(),
        program_id: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        amount: 1000000,
        decimals: 6,
      };
      const { data } = await axios.post("http://localhost:3030/approve", body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "privy-id-token": identityToken,
        },
        // withCredentials: true,
      });
      console.log(data);
      console.log(solanaAddress);
      const raw = Buffer.from(data.tx_message, "base64");
      console.log("raw", raw);

      const tx = Transaction.from(raw);
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
  useEffect(() => {
     const solanaWallet = user?.linkedAccounts.filter(
        (account): account is WalletWithMetadata => {
          console.log(account);
          return (
            account.type === "wallet" &&
            account.chainType === "solana" &&
            account.connectorType === "embedded"
          );
        }
      );
      console.log("solanaWallet", solanaWallet);
      if (!solanaWallet) {
        console.log("No solana wallet found");
        return;
      }
      setSolanaAddress(solanaWallet[0]?.address);
  }, [ready, solanaAddress]);
  async function check() {
    try {
       const usdcMint = new PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
      );
      const solAddress = new PublicKey(solanaAddress);
      const userAta = await getAssociatedTokenAddress(usdcMint, solAddress);
      console.log("userAta", userAta.toBase58());
      const getInfo = await getAccount(connection, userAta);
      console.log("getInfo", getInfo.amount);
      setDelegateInfo({
        delegate: getInfo.delegate?.toBase58() || "No delegate",
        amount: Number(getInfo.delegatedAmount),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  if (!ready) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
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
        className="mb-3 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
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
        className="mb-3 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        Logout
      </button>
      <div className="flex">
        <button
          onClick={placeOrder}
          className="mb-3 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Place order
        </button>
        <button className="mb-3 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20" onClick={check}>
          Check
        </button>
      </div>
      {delegateInfo && (
        <div>
          <p>Delegate: {delegateInfo.delegate}</p>
          <p>Delegated Amount: {delegateInfo.amount}</p>
        </div>
      ) }
    </div>
  );
}
