import { WalletAdapterNetwork, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import * as anchor from "@coral-xyz/anchor";
import { ConnectionProvider, WalletProvider, useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, web3, Provider, Wallet, BN  } from "@coral-xyz/anchor";
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@solana/wallet-adapter-react-ui/lib/types/Button';

import anchorProgramId from "./solly_bird_2.json";
import '../src/css/bootstrap.css'
import {
    //GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    //SlopeWalletAdapter,
    SolflareWalletAdapter,
    //SolletExtensionWalletAdapter,
    //SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import fs from "fs";
//import { actions, utils, programs, NodeWallet, Connection} from '@metaplex/js'; 
import { clusterApiUrl, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, PublicKey, TransactionInstruction } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useCallback, useState } from 'react';
import {
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createInitializeMintInstruction,
    createMintToCheckedInstruction,
    createTransferInstruction,
    getOrCreateAssociatedTokenAccount,
  } from "@solana/spl-token";

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const idl = require("./solly_bird_2.json");
const program = new PublicKey("FDvzFQxR51WN1kBYf5KsU5SwMAhvEsPoncjh76SS3cD1");
const lamports = 1;
let thelamports = 0;
let mint = new PublicKey("minqX2MJeTCVzJVJK3cZZfTyTYer84K9kLs8FuUNA3n");
const authority = anchor.web3.Keypair.fromSecretKey(new Uint8Array([158,79,224,201,82,100,135,45,199,144,33,44,151,222,88,219,19,145,96,78,199,207,83,235,201,97,130,234,68,110,248,20,0,54,86,35,17,102,7,217,145,40,229,123,9,214,3,247,226,186,175,231,175,100,12,18,143,89,248,49,199,64,117,188]));


function getWallet(){

    
}
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
            new PhantomWalletAdapter(),
            //new GlowWalletAdapter(),
            //new SlopeWalletAdapter(),
            //new SolletExtensionWalletAdapter(), 
            //new SolletWalletAdapter(),
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
    //let [lamports, setLamports] = useState(.1);
    //let [wallet, setWallet] = useState("9m5kFDqgpf7Ckzbox91RYcADqcmvxW4MmuNvroD5H2r9");
    const [publicKeyATA, setPublicKeyATA] = useState<PublicKey | null>(null);
    
  

    

    // const { connection } = useConnection();
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet, signTransaction } = useWallet();
    const programId = new PublicKey("FDvzFQxR51WN1kBYf5KsU5SwMAhvEsPoncjh76SS3cD1");
    const burnAddress = new PublicKey("burruoB1KBRvKRFWsg1Zkp35g1n9Fsms9WExFGCzuUD");


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
                console.log("here0");
                const signature1 = await sendTransaction(mint_tx, connection);
                        console.log("here1");

            
           console.log("here2");

                console.log("Tokens minted successfully!");


                console.log("Burning now");

                let burnATA = await getAssociatedTokenAddress(
                    mint,
                    burnAddress,
                  );
                        const burn_tx = new web3.Transaction().add(
                            createTransferInstruction(
                                publicKeyATA,
                                burnATA,
                                publicKey,
                                1
                            )
                        );
                        const latestBlockhash2 = await connection.getLatestBlockhash();
                        burn_tx.feePayer = publicKey;
                        burn_tx.recentBlockhash = latestBlockhash2.blockhash;
                        const signature2 = await sendTransaction(burn_tx, connection); 
            } else {
                console.log("publicKeyATA is null");
            }
            
        } catch (error) {
          console.error("Error minting tokens:", error);
        }
      };
 

    const signIn = useCallback( async () => {

        if (!publicKey) throw new WalletNotConnectedError();
        connection.getBalance(publicKey).then((bal) => {
            console.log(bal/LAMPORTS_PER_SOL);

        });

        //let lamportsI = LAMPORTS_PER_SOL*lamports;
        console.log(publicKey.toBase58());
        //console.log("lamports sending: {}", thelamports)

        let publicKeyATA = await getAssociatedTokenAddress(
            mint,
            publicKey,
        );
        const ataAccountInfo = await connection.getAccountInfo(publicKeyATA);

        if (ataAccountInfo !== null) {
            setPublicKeyATA(publicKeyATA);
            console.log('The ATA is live and initialized.');
            console.log("Processing to the main menu now.");

            //
        } else {
            
            const transaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    publicKey,
                    publicKeyATA,
                    publicKey,
                    mint,
                ),
                
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

    
function setTheLamports(e: any)
{
    console.log(Number(e.target.value));
    setTheLamports(Number(e.target.value));
    let lamports = e.target.value;
    thelamports = lamports;
}
    return (
       

        <div className="App">
                <div className="navbar">
        <div className="navbar-inner ">
          <a id="title" className="brand" href="#">Brand</a>
          <ul className="nav">


          </ul>
          <ul className="nav pull-right">
                      <li><a href="#">White Paper</a></li>
                      <li className="divider-vertical"></li>
                      <li><WalletMultiButton /></li>

                    </ul>
        </div>
      </div>
<input value={lamports} type="number" onChange={(e) => setTheLamports(e)}></input>
        <br></br>
      <button className='btn' onClick={signIn}>Sign In </button>
      <button className='btn' onClick={playButton}>Play</button>


        </div>
    );
};
