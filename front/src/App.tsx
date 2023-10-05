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
import { Helmet } from "react-helmet";
import {
  FC,
  ReactNode,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
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
import HomePage from "./components/HomePage";
import { Button } from "react-bootstrap";

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
  const [gameOverScore, setGameOverScore] = useState<number>(0);
  // const { connection } = useConnection();
  const [isGameOver, setIsGameOver] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  useEffect(() => {
    // @ts-ignore
    window.gameover = (score: number) => {
      setGameOverScore(score);
      setIsGameOver(true);
    };
  }, []);
  useEffect(() => {
    console.log("Game over score is :",gameOverScore)
    // @ts-ignore
    if (!window.gameRendered ) {
        window.gameRendered = false;
      
      setIsBurnCompleted(false);
    }
  }, [gameOverScore]);
  const grabPrize = async () => {
    if (publicKey) {
      const tx = new web3.Transaction();
      const tx0 = await program.methods.transferSol(new anchor.BN(1_000_000_000)).accounts({
        from: store.publicKey,
        to: publicKey,
      }).signers([]).instruction();
      tx.add(tx0);
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
        const tx = new web3.Transaction();
        console.log("testing all in anchor");
       
       const tx0 = await program.methods.transferSol(new anchor.BN(100_000_000)).accounts({
         from: publicKey,
         to: store.publicKey,
       }).signers([]).instruction();

       const tx1 = await program.methods.mintToken().accounts({
         mint: mint,
         tokenAccount: publicKeyATA,
         payer: authority.publicKey,
         tokenProgram: TOKEN_PROGRAM_ID,
       }).signers([]).instruction();

       const tx2 = await program.methods.burnToken().accounts({
         mint: mint,
         tokenProgram: TOKEN_PROGRAM_ID,
         from: publicKeyATA,
         authority: publicKey,
       }).signers([]).instruction();

       tx.add(tx0).add(tx1).add(tx2);

       const blockhash = await connection.getLatestBlockhash();
       tx.feePayer = publicKey;
       tx.recentBlockhash = blockhash.blockhash;
       tx.sign(authority);
       await sendTransaction(tx, connection);     

        
      
        window.gameRendered = true;
    setIsBurnCompleted(true);
    setIsGameOver(false);
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
        <Helmet>
        <script src="./game.js" type="text/javascript" />
      </Helmet>
     {/* <div className="score-container">
        <div id="bestScore"></div>
        <div id="currentScore"></div>
      </div> */}
      {!publicKey && !window?.gameRendered && <HomePage title= "Solly Bird" subtitle="Play 2 earn flappy bird game in speed of solana" />}
      {publicKey && !publicKeyATA && !isGameOver && !window?.gameRendered && <HomePage title="Sign In To Play"  />}
      {publicKey && publicKeyATA && !isGameOver && !window?.gameRendered && <HomePage subtitle="Press play to start"  />}
      
      {isGameOver && <HomePage title="Game Over" subtitle={`Your score is : ${gameOverScore}`}/>}
      <WalletMultiButton />
      {publicKeyATA && !window?.gameRendered &&<Button style={{marginTop: 15}}  onClick={playButton} className="connect-btn">
        Play
      </Button>}
      {isGameOver && gameOverScore>5 && !window?.gameRendered && <Button onClick={grabPrize} className="connect-btn">
        Grab Your Prize
      </Button>}
      {!publicKeyATA && !window?.gameRendered && <>
      <Button style={{marginTop: 15}} onClick={signIn} className="connect-btn">
        Sign In
      </Button>
      </>}
      
      {isBurnCompleted && publicKey && window?.gameRendered ? (
        <>
          <FlappyBird />
        </>
      ) : (
        <>
          {/* <div className="navbar">
            <div className="navbar-inner ">
              <ul className="nav pull-right">

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
          </button> */}
        </>
      )}
    </div>
  );
};
