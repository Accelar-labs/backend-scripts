#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, log};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Welcome to Okashi!
    ///
    /// This modal will appear when a contract function needs values.
    /// The `say_hi` function needs just one - your `name`.
    ///
    /// Have fun!
    pub fn say_hi(env: Env, name: String) {
        log!(&env, "Hello {}!", name);
    }
}