import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, TransactionMessage, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { FC, useCallback } from 'react';
import bs58 from 'bs58';
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor";
import idl from "./todo_list.json";
import { TodoList } from "./todo_list";
import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

export const ToDo: FC = () => {
    const ourWallet = useWallet();
    const { connection } = useConnection();
    const [title, setTitle] = useState(""); // Task title input
    const [description, setDescription] = useState(""); // Task description input
    const [tasks, setTasks] = useState<any[]>([]);
    const [titleToCheck, setTitleToCheck] = useState("");

    const getProvider = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    }

    const createUser = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<TodoList>(idl_object, anchProvider);
            const [userPda, userBump] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("USER_SEED"),
                anchProvider.publicKey.toBuffer(),
            ], programID);

            let signature = await program.methods.createUser().accountsPartial(
                {
                    userAccount: userPda,
                    authority: anchProvider.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                }
            ).rpc({ commitment: "confirmed" });
            notify({ type: 'success', message: "Your account created successfully", txid: signature });
        } catch (error) {
            notify({ type: 'error', message: `Creation Failed (Probably you already have an account)`, description: error?.message });
            console.error("Failed to create a user", error)
        }
    }

    const createTask = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<TodoList>(idl_object, anchProvider);

            const [userPda, userBump] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("USER_SEED"),
                anchProvider.publicKey.toBuffer(),
            ], programID);
        
            const [taskPda, taskBump] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("TASK_SEED"),
                utils.bytes.utf8.encode(title),
                anchProvider.publicKey.toBuffer(),
            ], programID);

            let signature = await program.methods.createTask(title, description).accountsPartial({
                taskAuthority: anchProvider.publicKey,
                task: taskPda,
                userAccount: userPda,
                systemProgram: web3.SystemProgram.programId,
            }
            ).rpc({ commitment: "confirmed" });

            notify({ type: 'success', message: "Task created", txid: signature });

        } catch (error) {
            notify({ type: 'error', message: `Task Creation Failed`, description: error?.message });
            console.error("Failed to add task", error)
        }
        
    }
    const getTasks = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<TodoList>(idl_object, anchProvider);

            const [userPda, userBump] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("USER_SEED"),
                anchProvider.publicKey.toBuffer(),
            ], programID);

            const taskList = [];
            let userData = await program.account.userAccount.fetch(userPda);
            for (const element of userData.taskPdas) {
                let taskData = await program.account.taskAccount.fetch(element);
                
                taskList.push({
                    publicKey: taskData.owner,
                    title: taskData.title,
                    description: taskData.description,
                    status: taskData.status ? "Done" : "Pending",
                });    
            }
            setTasks(taskList);
            console.log(taskList)

        } catch (error) {
            notify({ type: 'error', message: `Receiving Task Failed`, description: error?.message });
            console.error("Failed to retrive task", error)
        }
    }

    const checkTask = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<TodoList>(idl_object, anchProvider);

            const [userPda, userBump] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("USER_SEED"),
                anchProvider.publicKey.toBuffer(),
            ], programID);
        
            const [taskPda, taskBump] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("TASK_SEED"),
                utils.bytes.utf8.encode(titleToCheck),
                anchProvider.publicKey.toBuffer(),
            ], programID);
    
            let signature = await program.methods.markTaskDone(titleToCheck).accountsPartial(
                {
                  taskAuthority: anchProvider.publicKey,
                  taskAccount: taskPda,
                  userAccount: userPda,
                  systemProgram: web3.SystemProgram.programId,
                }
              ).rpc({ commitment: "confirmed" });

              notify({ type: 'success', message: "Task marked as done", txid: signature });
        } catch (error) {
            notify({ type: 'error', message: `Receiving Task Failed`, description: error?.message });
            console.error("Failed to retrive task", error);
        }
    }

    return (
        <div className="flex flex-row justify-center">
            <div className="relative group items-center"  style={{ display: 'flex', flexDirection: 'column' }}>
                {/* <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div> */}
                <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={createUser}
                >
                    <div className="hidden group-disabled:block ">
                        Wallet not connected
                    </div>
                    <span className="block group-disabled:hidden" >
                        Create Account
                    </span>
                </button>


                <input
                    className="input m-2 p-2 border rounded"
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    className="input m-2 p-2 border rounded"
                    type="text"
                    placeholder="Task Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button
                    className="group w-60 m-2 btn bg-gradient-to-br from-green-500 to-blue-500 hover:from-white hover:to-green-300 text-black"
                    onClick={createTask}
                >
                    <span>Create Task</span>
                </button>

                
                <input
                    className="input m-2 p-2 border rounded"
                    type="text"
                    placeholder="Task Title"
                    value={titleToCheck}
                    onChange={(e) => setTitleToCheck(e.target.value)}
                />
                <button
                    className="group w-60 m-2 btn bg-gradient-to-br from-green-500 to-blue-500 hover:from-white hover:to-green-300 text-black"
                    onClick={checkTask}
                >
                    <span>Mark Task as Done</span>
                </button>

                
                <div className="task-list">
            {/* <h1 className="text-2xl font-bold mb-4">Your Tasks</h1> */}
            <button
                className="group w-60 m-2 btn bg-gradient-to-br from-green-500 to-blue-500 hover:from-white hover:to-green-300 text-black"
                onClick={getTasks}
            >
                Fetch Tasks
            </button>
            {tasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <ul className="list-disc ml-5">
                    {tasks.map((task, index) => (
                        <div key={index} className="p-3 border border-gray-300 rounded-lg shadow-md">
                            <div className="p-3 border border-gray-300 rounded-lg shadow-md">
                                <p><strong>Title:</strong> {task.title}</p>
                                <p><strong>Description:</strong> {task.description}</p>
                                <p><strong>Status:</strong> {task.status}</p>
                            </div>
                        </div>
                    ))}
                </ul>
            )}
        </div>


            </div>
            
        </div>

    );
};
