import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { OperationType } from "../../entities/Statement";
import { CreateTransferError } from "./CreateTranferError";


let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createTransferUseCase: CreateTransferUseCase;

describe("Create Transfer", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    createTransferUseCase = new CreateTransferUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("should be able to create a new transfer", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User",
      email: "user@email.com",
      password: "1234"
    })

    const sender = await usersRepositoryInMemory.create({
      name: "Sender",
      email: "sender@email.com",
      password: "1234"
    })

    const user_id = user.id as string
    const sender_id = sender.id as string

    await statementsRepositoryInMemory.create({
      user_id: sender_id,
      amount: 15.00,
      description: 'Test of deposit',
      type: OperationType.DEPOSIT,
    })

    const transfer = await createTransferUseCase.execute({
      sender_id,
      user_id,
      amount: 15.00,
      description: 'Test of transfer',
      type: OperationType.TRANSFER,
    })

    expect(transfer).toHaveProperty("id");
  });

  it("should not be able to create a new transfer without amount", () => {
    expect(async () => {
      await createTransferUseCase.execute({
        sender_id: 'invalid sender',
        user_id: 'invalid user',
        amount: 0,
        description: 'Test of transfer',
        type: OperationType.TRANSFER,
      })
    }).rejects.toBeInstanceOf(CreateTransferError.InvalidAmount)
  });

  it("should not be able to create a new transfer with non existent user", () => {
    expect(async () => {
      await createTransferUseCase.execute({
        sender_id: 'invalid sender',
        user_id: 'invalid user',
        amount: 15.00,
        description: 'Test of transfer',
        type: OperationType.TRANSFER,
      })
    }).rejects.toBeInstanceOf(CreateTransferError.UserNotFound)
  });

  it("should not be able to create a new transfer with non existent sender", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User",
      email: "user@email.com",
      password: "1234"
    })

    const user_id = user.id as string

    expect(async () => {
      await createTransferUseCase.execute({
        sender_id: 'invalid sender',
        user_id,
        amount: 15.00,
        description: 'Test of transfer',
        type: OperationType.TRANSFER,
      })
    }).rejects.toBeInstanceOf(CreateTransferError.SenderNotFound)
  });


  it("should not be able to create a transfer with no funds", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User",
      email: "user@email.com",
      password: "1234"
    })

    const sender = await usersRepositoryInMemory.create({
      name: "Sender",
      email: "sender@email.com",
      password: "1234"
    })

    const user_id = user.id as string
    const sender_id = sender.id as string

    expect(async () => {
      await createTransferUseCase.execute({
        sender_id,
        user_id,
        amount: 15.00,
        description: 'Test of transfer',
        type: OperationType.TRANSFER,
      })
    }).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds)
  });
});
