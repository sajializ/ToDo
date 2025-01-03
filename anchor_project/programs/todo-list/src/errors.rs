use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Title of the task is too long")]
    TitleTooLong,
    #[msg("Description of the task is too long")]
    DescriptionTooLong,
    #[msg("Selected task does not exist")]
    TaskDoesNotExist,
}
