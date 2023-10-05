use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token;
use anchor_spl::token::{Token, Burn, Mint, MintTo, Transfer as SplTransfer, Approve};
use anchor_lang::solana_program::system_instruction;

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

    pub fn transfer_sol(ctx: Context<TransferSol>, amount: u64) -> Result<()> {
        
        let from_account = &ctx.accounts.from;
        let to_account = &ctx.accounts.to;

        let transfer_instruction = system_instruction::transfer(from_account.key, to_account.key, amount);

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_instruction,
            &[
                from_account.to_account_info(),
                to_account.to_account_info(),
                ctx.accounts.system_program.to_account_info()
            ],
            &[],
        )?;

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



    pub fn burn_token(ctx: Context<BurnToken>) -> Result<()> {
        
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.from.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::burn(cpi_ctx, 1)?;
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
    #[account(mut)]
    pub from: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
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



#[derive(Accounts)]
pub struct BurnToken<'info> {
    /// CHECK: This is the token that we want to mint
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the token account that we want to mint tokens to
    #[account(mut)]
    pub from: AccountInfo<'info>,
    /// CHECK: the authority of the mint account
    pub authority: Signer<'info>,
}