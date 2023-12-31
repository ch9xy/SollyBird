import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { SollyBird2 } from "../target/types/solly_bird_2";
import { assert } from "chai";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createBurnCheckedInstruction,
} from "@solana/spl-token";
import { Connection, clusterApiUrl, Keypair, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction, TransactionMessage } from "@solana/web3.js";
import { min } from "bn.js";

describe("solly-bird-2", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SollyBird2 as Program<SollyBird2>;

  const mintKey = anchor.web3.Keypair.generate();
  const user1 = anchor.web3.Keypair.fromSecretKey(new Uint8Array([70,171,97,137,61,108,141,203,231,82,111,85,232,247,227,94,134,124,155,241,244,156,83,109,36,21,246,148,14,85,224,228,13,139,117,156,76,182,244,66,119,95,97,178,22,182,212,236,73,153,207,92,105,134,196,162,247,102,143,66,106,152,91,70]));
  const user2 = anchor.web3.Keypair.fromSecretKey(new Uint8Array([104,115,81,238,173,24,67,45,190,133,192,188,190,119,194,149,110,71,233,4,88,146,157,121,224,110,196,161,231,67,27,149,8,157,187,172,76,162,234,77,67,114,54,226,193,117,99,12,149,45,176,178,168,42,2,128,162,243,184,150,102,32,35,65]));
  const key = anchor.web3.Keypair.fromSecretKey(new Uint8Array([158,79,224,201,82,100,135,45,199,144,33,44,151,222,88,219,19,145,96,78,199,207,83,235,201,97,130,234,68,110,248,20,0,54,86,35,17,102,7,217,145,40,229,123,9,214,3,247,226,186,175,231,175,100,12,18,143,89,248,49,199,64,117,188]));
  const programId = new web3.PublicKey("FDvzFQxR51WN1kBYf5KsU5SwMAhvEsPoncjh76SS3cD1");

  it("successfully transfers sol", async () => {

    console.log("BEFORE: ");
    console.log(user1.publicKey, user2.publicKey);
    let user1SolBalance = await program.provider.connection.getBalance(user1.publicKey);
      console.log(`User SOL balance: ${user1SolBalance} lamports`);

      // Get SOL balance for the admin account
      let user2SolBalance = await program.provider.connection.getBalance(user2.publicKey);
      console.log(`Admin SOL balance: ${user2SolBalance} lamports`);



    //var tx = new web3.Transaction().add(
    //  SystemProgram.transfer({
    //    fromPubkey: user1.publicKey,
    //    toPubkey:   user2.publicKey,
    //    lamports: 100_000_000
    //  }),
    //);
   //const signature = await sendTransaction(tx, connection);


     // //const amount = BigInt(1000000);
     // const amountBuffer = Buffer.alloc(250);
     // //amountBuffer.writeBigUint64LE(amount);
     // const tx = new web3.Transaction().add(
     //   new web3.TransactionInstruction({
     //   programId: programId,
     //   keys: [ 
     //       {pubkey: user1.publicKey, isSigner: true, isWritable: true},
     //       {pubkey: user2.publicKey, isSigner: false, isWritable: true},
     //       {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
     //       
     //     ],
     //     data: amountBuffer,
     // }));
//const latestBlockhash = await program.provider.connection.getLatestBlockhash();
//tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
//tx.recentBlockhash = latestBlockhash.blockhash;
//tx.feePayer = publicKey;
//tx.sign(user1);
//const res = await anchor.AnchorProvider.env().sendAndConfirm(tx, [user1]);

   // WORKING WELL
    const tx = await program.methods.transferSol(new anchor.BN(100_000_000)).accounts({
      from: user1.publicKey,
      to: user2.publicKey,
    }).signers([user1]).rpc();
    console.log("tx: ", tx);
//
    console.log("AFTER: ");

    user1SolBalance = await program.provider.connection.getBalance(user1.publicKey);
      console.log(`User SOL balance: ${user1SolBalance} lamports`);

      // Get SOL balance for the admin account
      user2SolBalance = await program.provider.connection.getBalance(user2.publicKey);
      console.log(`Admin SOL balance: ${user2SolBalance} lamports`);

  });

  it("creates and initializes mint", async () => {

      const tx = await program.methods.initializeMint().accounts({
        mint: mintKey.publicKey,
        payer: key.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }).signers([key, mintKey]).rpc();
      console.log("mintKey: ", mintKey.publicKey);
  });

  it("creates ATA and mints 1 token to it", async () => {

    let user1ATA = await getAssociatedTokenAddress(
      mintKey.publicKey,
      user1.publicKey,
    );

      const ata_tx = new anchor.web3.Transaction().add(
        createAssociatedTokenAccountInstruction(
          user1.publicKey,
          user1ATA,
          user1.publicKey,
          mintKey.publicKey,
        ),
      );
      const res = await anchor.AnchorProvider.env().sendAndConfirm(ata_tx, [user1]);
      console.log(res);

      //const mint = new anchor.web3.PublicKey("FY92xeo9v23ojfXrJ8YCe66Co6PGPQBSYgRCa1RSLVtd");
      //const ata = new anchor.web3.PublicKey("7dhKf2n4ijjeJRGaBWiq4ZjZFiqzFKn8GS6JAJXTj93r");
      const mint_tx = await program.methods.mintToken().accounts({
        mint: mintKey.publicKey,
        tokenAccount: user1ATA,
        payer: key.publicKey,
        //tokenProgram: TOKEN_PROGRAM_ID,
      }).signers([key]).rpc();
      console.log(mint_tx);
      console.log("created ata:", user1ATA);
      //
      const minted = (await program.provider.connection.getParsedAccountInfo(user1ATA)).value.data.parsed.info.tokenAmount.amount;
      assert.equal(minted, 1);

  })
  it("burns a token", async () => {

    let user1ATA = await getAssociatedTokenAddress(
      mintKey.publicKey,
      user1.publicKey,
    );
    let minted1 = (await program.provider.connection.getParsedAccountInfo(user1ATA)).value.data.parsed.info.tokenAmount.amount;
    console.log(minted1);
    const burn_tx = await program.methods.burnToken().accounts({
      mint: mintKey.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      from: user1ATA,
      authority: user1.publicKey,
    }).signers([user1]).rpc();
    let minted2 = (await program.provider.connection.getParsedAccountInfo(user1ATA)).value.data.parsed.info.tokenAmount.amount;
    console.log(minted2);
   //t user1ATA = await getAssociatedTokenAddress(
   //mintKey.publicKey,
   //user1.publicKey,
   //

   //nst burnIx = createBurnCheckedInstruction(
   //user1ATA,
   //mintKey.publicKey,
   //user1.publicKey,
   //1,
   //0
   //
   //
   //nst {blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('finalized');
   //console.log(`Latest Blockhash: ${blockhash}`);
   //const messageV0 = new TransactionMessage({
   //  payerKey: user1.publicKey,
   //  recentBlockhash: blockhash,
   //  instructions: [burnIx],
   //}).compileToV0Message();
   //const transaction = new VersionedTransaction(messageV0);
   //transaction.sign([user1]);
   //console.log("tx created and signed.");

   //const txid = await program.provider.connection.sendTransaction(transaction);
   //const confirmation = await program.provider.connection.confirmTransaction({
   //  signature: txid,
   //  blockhash: blockhash,
   //  lastValidBlockHeight: lastValidBlockHeight
   //});
   //if (confirmation.value.err) { throw new Error("Tx is not confirmed")}
   //console.log("Successfull burn!");

  }) 
});
