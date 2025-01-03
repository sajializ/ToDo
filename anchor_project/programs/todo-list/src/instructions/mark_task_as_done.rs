use anchor_lang::prelude::*;

use crate::states::*;
use crate::errors::Errors;

pub fn mark_task_as_done(ctx: Context<MarkTaskDone>, title: String) -> Result<()> {
    let task_account = &mut ctx.accounts.task_account;
    
    require!(
        title == task_account.title,
        Errors::TaskDoesNotExist
    );

    task_account.status = true;
    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct MarkTaskDone<'info> {
    #[account(mut)]
    pub task_authority: Signer<'info>,
    #[account(
        mut,
        seeds = [
            TASK_SEED.as_bytes(),
            title.as_bytes(),
            task_authority.key().as_ref()
            ],
        bump,
    )]
    pub task_account: Account<'info, TaskAccount>,
    #[account(
        seeds = [USER_SEED.as_bytes(), task_authority.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}
