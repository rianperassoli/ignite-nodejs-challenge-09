import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";


let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("should be able to create a new statement", async () => {

    const user = await usersRepositoryInMemory.create({
      name: 'User Test',
      email: 'usertest@email.com',
      password: '12345',
    })

    const user_id = user.id as string

    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 15.00,
      description: 'Test of deposit',
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a new statement with non existent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'invalid user',
        amount: 15.00,
        description: 'Test of withdraw',
        type: OperationType.WITHDRAW,
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it("should not be able to create a new withdraw statement with no funds", () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: 'User Test',
        email: 'usertest@email.com',
        password: '12345',
      })

      const user_id = user.id as string

      await createStatementUseCase.execute({
        user_id,
        amount: 15.00,
        description: 'Test of withdraw',
        type: OperationType.WITHDRAW,
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
