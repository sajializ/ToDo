# Todo List Application

## Quick Access
- **Smart Contract Address:** `J7qXxzHer5PGZpsQG7nhreGnBcKdHiVRMTj3xUXrELb6`  
  [View on Solana Explorer](https://explorer.solana.com/address/J7qXxzHer5PGZpsQG7nhreGnBcKdHiVRMTj3xUXrELb6?cluster=devnet)
- **Webpage:** [Todo List Frontend](https://to-do-front-m1b0biuu5-sajializs-projects.vercel.app/)

---

## Project Overview

The Todo List Application is a decentralized task management platform built on the Solana blockchain using the Anchor framework and a React-based frontend. Users can interact with the application to create accounts, manage tasks, and update task statuses securely on-chain.

---

## Functionalities

### Smart Contract Features
1. **Create User**  
   Users can create secure, on-chain accounts linked to their wallets using a Program-Derived Address (PDA).

2. **Add Task**  
   Users can add tasks with a title and description, stored securely on-chain. Tasks default to `not done`.

3. **Mark Task as Done**  
   Users can mark tasks as completed by specifying the task title, updating its status on-chain.

### Frontend Features
1. **Wallet Connection**  
   The webpage allows users to connect their Solana-compatible wallets seamlessly.

2. **Task Management**  
   Users can create accounts, add tasks with a title and description, mark tasks as done, and fetch all their tasks via an intuitive interface.

---

## Deployed Results

### Smart Contract
The program has been deployed on Solana Devnet.  
**Program Address:** `J7qXxzHer5PGZpsQG7nhreGnBcKdHiVRMTj3xUXrELb6`  
[View on Solana Explorer](https://explorer.solana.com/address/J7qXxzHer5PGZpsQG7nhreGnBcKdHiVRMTj3xUXrELb6?cluster=devnet)

### Frontend
The frontend is deployed using Vercel.  
**Webpage URL:** [Todo List Frontend](https://to-do-front-m1b0biuu5-sajializs-projects.vercel.app/)

---

## Test Results

The smart contract was tested with the following results:

```plaintext
todo-list
    ✔ creates user (411ms)
    ✔ creates existing user should fail
    ✔ creates new task for bob (256ms)
    ✔ creates another task for bob (345ms)
    ✔ create lengthy title
    ✔ create lengthy description
    ✔ marks task as done (146ms)
    ✔ marks task with wrong title

  8 passing (2s)
```

## Build and Test Instructions
### Anchor program
#### Install dependencies
```bash
npm install
```
#### Build the Anchor program
```bash
anchor build
```
#### Run the tests
```bash
anchor test
```
### Frontend
#### Install dependencies
```bash
npm install
```
#### Run the app locally
```bash
npm run dev
```
#### Build the app
```bash
npm run build
```
