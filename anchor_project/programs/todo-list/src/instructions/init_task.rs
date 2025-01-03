use anchor_lang::prelude::*;

use crate::errors::Errors;
use crate::states::*;

pub fn init_task(ctx: Context<CreateTask>, title: String, description: String) -> Result<()> {
    let task_account = &mut ctx.accounts.task;
    let user_account = &mut ctx.accounts.user_account;

    require!(
        title.as_bytes().len() <= TITLE_LENGTH,
        Errors::TitleTooLong
    );

    require!(
        description.as_bytes().len() <= DESC_LENGTH,
        Errors::DescriptionTooLong
    );

    task_account.owner = ctx.accounts.task_authority.key();
    task_account.title = title;
    task_account.description = description;
    task_account.status = false;

    user_account.task_pdas.push(task_account.key());

    user_account.task_count += 1;
    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub task_authority: Signer<'info>,
    #[account(
        init,
        payer = task_authority,
        space = 8 + TaskAccount::LEN,
        seeds = [
            TASK_SEED.as_bytes(),
            title.as_bytes(),
            task_authority.key().as_ref()
            ],
        bump)]
    pub task: Account<'info, TaskAccount>,
    #[account(
        mut,
        seeds = [
            USER_SEED.as_bytes(),
            task_authority.key().as_ref(),
        ],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}
