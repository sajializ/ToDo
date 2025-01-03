use anchor_lang::prelude::*;

use crate::instructions::*;

pub mod instructions;
pub mod states;
pub mod errors;

declare_id!("J7qXxzHer5PGZpsQG7nhreGnBcKdHiVRMTj3xUXrELb6");

#[program]
pub mod todo_list {
    use super::*;

    pub fn create_user(ctx: Context<InitializeUser>) -> Result<()> {
        return init_user(ctx);
    }

    pub fn create_task(ctx: Context<CreateTask>, title: String, description: String) -> Result<()> {
        return init_task(ctx, title, description);
    }

    pub fn mark_task_done(ctx: Context<MarkTaskDone>, title: String) -> Result<()> {
        return mark_task_as_done(ctx, title);
    }
}
