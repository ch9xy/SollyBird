import {
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from "@solana/wallet-adapter-base";
import * as anchor from "@coral-xyz/anchor";
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Program, web3, Provider, Wallet, BN } from "@coral-xyz/anchor";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import "../src/css/bootstrap.css";
import {
  //GlowWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  //SlopeWalletAdapter,
  SolflareWalletAdapter,
  //SolletExtensionWalletAdapter,
  //SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
//import { actions, utils, programs, NodeWallet, Connection} from '@metaplex/js';
import {
  clusterApiUrl,
  VersionedTransaction,
  TransactionMessage,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { FC, ReactNode, useMemo, useCallback, useState } from "react";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  createBurnCheckedInstruction,
} from "@solana/spl-token";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import FlappyBird from "./Game";

require("./App.css");
require("@solana/wallet-adapter-react-ui/styles.css");

const idl = require("./solly_bird_2.json");
const programId = new PublicKey("FDvzFQxR51WN1kBYf5KsU5SwMAhvEsPoncjh76SS3cD1");
//const program = new Program(idl, programId);

const lamports = 1;
let thelamports = 0;
let mint = new PublicKey("minqX2MJeTCVzJVJK3cZZfTyTYer84K9kLs8FuUNA3n");
const authority = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array([
    158, 79, 224, 201, 82, 100, 135, 45, 199, 144, 33, 44, 151, 222, 88, 219,
    19, 145, 96, 78, 199, 207, 83, 235, 201, 97, 130, 234, 68, 110, 248, 20, 0,
    54, 86, 35, 17, 102, 7, 217, 145, 40, 229, 123, 9, 214, 3, 247, 226, 186,
    175, 231, 175, 100, 12, 18, 143, 89, 248, 49, 199, 64, 117, 188,
  ])
);
const store = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array([
    189, 230, 61, 49, 199, 101, 149, 191, 214, 52, 33, 115, 103, 195, 141, 195,
    218, 111, 83, 95, 31, 69, 24, 10, 38, 83, 25, 179, 68, 151, 132, 195, 13, 9,
    158, 158, 58, 21, 160, 159, 184, 212, 151, 83, 15, 77, 21, 249, 58, 118, 47,
    21, 145, 201, 54, 82, 84, 56, 144, 77, 37, 44, 176, 37,
  ])
);
//const systemProgramId = new PublicKey('ComputeBudget111111111111111111111111111111');

const App: FC = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};

export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new LedgerWalletAdapter(),
      new PhantomWalletAdapter({ network }),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content: FC = () => {
  const [publicKeyATA, setPublicKeyATA] = useState<PublicKey | null>(null);
  const [isBurnCompleted, setIsBurnCompleted] = useState<boolean>(false);
  // const { connection } = useConnection();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const grabPrize = async () => {
    if (publicKey) {
      var tx = new web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: store.publicKey,
          toPubkey: publicKey,
          lamports: 1_000_000_000,
        })
      );
      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.sign(store);
      await sendTransaction(tx, connection);

      let user1SolBalance = await connection.getBalance(store.publicKey);
      console.log(`User SOL balance: ${user1SolBalance} lamports`);

      // Get SOL balance for the admin account
      if (publicKey) {
        let user2SolBalance = await connection.getBalance(publicKey);
        console.log(`Admin SOL balance: ${user2SolBalance} lamports`);
      }
    }

    console.log("After: ");
    let user1SolBalance = await connection.getBalance(store.publicKey);
    console.log(`User SOL balance: ${user1SolBalance} lamports`);

    if (publicKey) {
      let user2SolBalance = connection.getBalance(publicKey);
      console.log(`Admin SOL balance: ${user2SolBalance} lamports`);
    }
  };

  const playButton = async () => {
    try {
      if (!publicKey) throw new WalletNotConnectedError();

      if (publicKeyATA) {
        let mint_tx = new web3.Transaction().add(
          createMintToCheckedInstruction(
            mint,
            publicKeyATA,
            authority.publicKey,
            1,
            0
          )
        );
        const latestBlockhash = await connection.getLatestBlockhash();
        mint_tx.feePayer = publicKey;
        mint_tx.recentBlockhash = latestBlockhash.blockhash;
        mint_tx.sign(authority);
        await sendTransaction(mint_tx, connection);
        console.log("1 token minted successfully!");

        console.log("Burning now");

        const burnIx = createBurnCheckedInstruction(
          publicKeyATA,
          mint,
          publicKey,
          1,
          0
        );
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("finalized");
        console.log(`Latest Blockhash: ${blockhash}`);
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions: [burnIx],
        }).compileToV0Message();
        const transactionBurn = new VersionedTransaction(messageV0);
        const signatureBurn = await sendTransaction(
          transactionBurn,
          connection
        );
        const confirmation = await connection.confirmTransaction({
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
          signature: signatureBurn,
        });
        if (confirmation.value.err) {
          throw new Error("Tx is not confirmed");
        }
        console.log("Successfull burn!");
      } else {
        console.log("publicKeyATA is null");
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const signIn = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    connection.getBalance(publicKey).then((bal) => {
      console.log(bal / LAMPORTS_PER_SOL);
    });

    console.log(publicKey.toBase58());

    let publicKeyATA = await getAssociatedTokenAddress(mint, publicKey);
    const ataAccountInfo = await connection.getAccountInfo(publicKeyATA);

    if (ataAccountInfo !== null) {
      setPublicKeyATA(publicKeyATA);
      console.log("The ATA is live and initialized.");
      console.log("Processing to the main menu now.");
    } else {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          publicKeyATA,
          publicKey,
          mint
        )
      );

      const signature = await sendTransaction(transaction, connection);
      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
      console.log("publicKeyATA: ", publicKeyATA);
      setPublicKeyATA(publicKeyATA);
    }
  }, [publicKey, sendTransaction, connection]);

  function setTheLamports(e: any) {
    console.log(Number(e.target.value));
    setTheLamports(Number(e.target.value));
    let lamports = e.target.value;
    thelamports = lamports;
  }
  return (
    <div className="App">
      {isBurnCompleted ? (
        <FlappyBird />
      ) : (
        <>
          <div className="navbar">
            <div className="navbar-inner ">
              <a id="title" className="brand" href="#">
                Brand
              </a>
              <ul className="nav"></ul>
              <ul className="nav pull-right">
                <li>
                  <a href="#">White Paper</a>
                </li>
                <li className="divider-vertical"></li>
                <li>
                  <WalletMultiButton />
                </li>
              </ul>
            </div>
          </div>
          <input
            value={lamports}
            type="number"
            onChange={(e) => setTheLamports(e)}
          ></input>
          <br></br>
          <button className="btn" onClick={signIn}>
            Sign In{" "}
          </button>
          <button className="btn" onClick={playButton}>
            Play
          </button>
          <button className="btn" onClick={grabPrize}>
            GRAB YOUR PRIZE!
          </button>
        </>
      )}
    </div>
  );
};
