use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token;
use anchor_spl::token::{Token, Mint, MintTo, Transfer as SplTransfer};
use solana_program::system_instruction;

declare_id!("FDvzFQxR51WN1kBYf5KsU5SwMAhvEsPoncjh76SS3cD1");

#[program]
pub mod solly_bird_2 {
    use super::*;

    pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        Ok(())
    }

    pub fn mint_token(ctx: Context<MintToken>) -> Result<()> {
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::mint_to(cpi_ctx, 1)?;
        Ok(())
    }

    pub fn transfer_sol(ctx: Context<TransferSol>) -> Result<()> {
        
       let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.sender.clone(),
            to: ctx.accounts.receiver.clone(),
        });

        system_program::transfer(cpi_context, 100_000_000)?;

        Ok(())
    }
    pub fn into_session(ctx: Context<IntoSession>) -> Result<()> {
        
        let cpi_accounts = SplTransfer {
            from: ctx.accounts.playerATA.to_account_info().clone(),
            to: ctx.accounts.burnAddress.to_account_info().clone(),
            authority: ctx.accounts.authority.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(
            CpiContext::new(cpi_program, cpi_accounts), 1)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintToken<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: AccountInfo<'info>,
    #[account(mut, signer)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub payer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferSol<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut, signer)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub sender: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub receiver: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    ///CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
}


#[derive(Accounts)]
pub struct IntoSession<'info> {
    pub playerPubKey: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub playerATA: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub burnAddress: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint: Account<'info, Mint>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,
}
