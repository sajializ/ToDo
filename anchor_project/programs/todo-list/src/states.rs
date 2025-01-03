use anchor_lang::prelude::*;

pub const TITLE_LENGTH: usize = 32;
pub const DESC_LENGTH: usize = 500;
pub const ACCOUNT_SIZE: usize = 1000;

pub const USER_SEED: &str = "USER_SEED";
pub const TASK_SEED: &str = "TASK_SEED";

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub task_count: u32,
    pub task_pdas: Vec<Pubkey>,
    pub bump: u8,
}

#[account]
pub struct TaskAccount {
    pub owner: Pubkey,
    pub title: String,
    pub description: String,
    pub status: bool, // false = Pending, true = Done
    pub bump: u8,
}

impl TaskAccount {
    pub const LEN: usize = 32 + 256 + 256 + 1 + 1;
}