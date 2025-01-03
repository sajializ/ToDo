import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoList } from "../target/types/todo_list";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";
import crypto from "crypto";

const USER_SEED = "USER_SEED";
const TASK_SEED = "TASK_SEED";

describe("todo-list", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TodoList as Program<TodoList>;

  const bob = anchor.web3.Keypair.generate();
  const alice = anchor.web3.Keypair.generate();

  beforeEach(async () => {
    await airdrop(provider.connection, bob.publicKey);
  })

  it("creates user", async () => {
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);

    await program.methods.createUser().accounts(
      {
        user_account: userPda,
        authority: bob.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    ).signers([bob]).rpc({ commitment: "confirmed" });

    await checkUser(program, userPda, bob.publicKey, 0);
  });

  it("creates existing user should fail", async () => {
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);

    try {
      await program.methods.createUser().accounts(
        {
          user_account: userPda,
          authority: bob.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).signers([bob]).rpc({ commitment: "confirmed" });
      assert.ok(false);
    } catch (err) {
      assert.ok(true);
    }
  });

  it("creates new task for bob", async () => {
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);

    const title = "title";
    const content = "content";
    const [taskPda, taskBump] = getTaskAddress(bob.publicKey, title, program.programId);

    await program.methods.createTask(title, content).accounts(
      {
        taskAuthority: bob.publicKey,
        task: taskPda,
        userAccount: userPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    ).signers([bob]).rpc({ commitment: "confirmed" });

    let taskData = await program.account.taskAccount.fetch(taskPda);
    let userData = await program.account.userAccount.fetch(userPda);
    await checkUser(program, userPda, bob.publicKey, 1);
    await checkTask(program, taskPda, bob.publicKey, title, content, false);
  });

  it("creates another task for bob", async () => {
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);

    const title = "title2";
    const content = "content";
    const [taskPda, taskBump] = getTaskAddress(bob.publicKey, title, program.programId);

    await program.methods.createTask(title, content).accounts(
      {
        taskAuthority: bob.publicKey,
        task: taskPda,
        userAccount: userPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    ).signers([bob]).rpc({ commitment: "confirmed" });

    let taskData = await program.account.taskAccount.fetch(taskPda);
    let userData = await program.account.userAccount.fetch(userPda);
    await checkUser(program, userPda, bob.publicKey, 2);
    await checkTask(program, taskPda, bob.publicKey, title, content, false);
  });

  it("create lengthy title", async () => {
    let title = "title";
    const content = "content";
    let long_title = title.repeat(50);
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);
    

    try {
      const [taskPda, taskBump] = getTaskAddress(bob.publicKey, long_title, program.programId);
      await program.methods.createTask(long_title, content).accounts(
        {
          taskAuthority: bob.publicKey,
          task: taskPda,
          userAccount: userPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).signers([bob]).rpc({ commitment: "confirmed" });
      assert.ok(false);
    } catch (err) {
      assert.ok(true);
    }
  });

  it("create lengthy description", async () => {
    let title = "title";
    const content = "content";
    let long_content = content.repeat(50);
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);
    

    try {
      const [taskPda, taskBump] = getTaskAddress(bob.publicKey, title, program.programId);
      await program.methods.createTask(title, long_content).accounts(
        {
          taskAuthority: bob.publicKey,
          task: taskPda,
          userAccount: userPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).signers([bob]).rpc({ commitment: "confirmed" });
      assert.ok(false);
    } catch (err) {
      assert.ok(true);
    }
  });

  it("marks task as done", async () => {
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);

    const title = "title";
    const content = "content";
    const [taskPda, taskBump] = getTaskAddress(bob.publicKey, title, program.programId);

    await program.methods.markTaskDone(title).accounts(
      {
        taskAuthority: bob.publicKey,
        taskAccount: taskPda,
        userAccount: userPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    ).signers([bob]).rpc({ commitment: "confirmed" });

    let taskData = await program.account.taskAccount.fetch(taskPda);
    await checkTask(program, taskPda, bob.publicKey, title, content, true);
  });

  it("marks task with wrong title", async () => {
    const [userPda, userBump] = getUserAddress(bob.publicKey, program.programId);

    const title = "not exist title";
    const content = "content";
    const [taskPda, taskBump] = getTaskAddress(bob.publicKey, title, program.programId);

    try {
      await program.methods.markTaskDone(title).accounts(
        {
          taskAuthority: bob.publicKey,
          taskAccount: taskPda,
          userAccount: userPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).signers([bob]).rpc({ commitment: "confirmed" });
      assert.ok(false);
    } catch (err) {
      assert.ok(true);
    }
  });
});

async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

async function checkUser(program:anchor.Program<TodoList>, userPda: PublicKey, user: PublicKey, task_count: number) {
  let userData = await program.account.userAccount.fetch(userPda);
  assert.strictEqual(userData.owner.toString(), user.toString());
  assert.strictEqual(userData.taskCount, task_count);
  assert.strictEqual(userData.taskPdas.length, task_count);
}

async function checkTask(program:anchor.Program<TodoList>, taskPda: PublicKey, owner: PublicKey, title: string, description: string, status: boolean) {
  let taskData = await program.account.taskAccount.fetch(taskPda);
  assert.strictEqual(taskData.owner.toString(), owner.toString());
  assert.strictEqual(taskData.title, title);
  assert.strictEqual(taskData.description, description);
  assert.strictEqual(taskData.status, status);
}

function getUserAddress(user: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(USER_SEED),
      user.toBuffer(),
    ], programID);
}

function getTaskAddress(user: PublicKey, title:string, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(TASK_SEED),
      anchor.utils.bytes.utf8.encode(title),
      user.toBuffer(),
    ], programID);
}