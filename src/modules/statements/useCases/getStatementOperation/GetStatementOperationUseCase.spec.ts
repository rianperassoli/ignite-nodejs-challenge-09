import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("should be able to get the statement operation", async () => {

    const user = await usersRepositoryInMemory.create({
      name: 'User Test',
      email: 'usertest@email.com',
      password: '12345',
    })

    const user_id = user.id as string

    const statement = await statementsRepositoryInMemory.create({
      user_id,
      amount: 15.00,
      description: 'Test of deposit',
      type: OperationType.DEPOSIT,
    });

    await statementsRepositoryInMemory.create({
      user_id,
      amount: 10.00,
      description: 'Test of withdraw',
      type: OperationType.WITHDRAW,
    });

    const statement_id = statement.id as string

    const operation = await getStatementOperationUseCase.execute({ user_id, statement_id })

    expect(operation).toBeInstanceOf(Statement);
    expect(operation).toHaveProperty('id');
    expect(operation.type).toBe(OperationType.DEPOSIT);
    expect(operation.id).toBe(statement_id);
    expect(operation.user_id).toBe(user_id);
  });

  it("should not be able to get the statement operation with a non existent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: 'Invalid user', statement_id: 'Statement Id' })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it("should not be able to get the statement operation with a non existent user", () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: 'User Test',
        email: 'usertest@email.com',
        password: '12345',
      })

      const user_id = user.id as string

      await getStatementOperationUseCase.execute({ user_id, statement_id: 'Statement Id' })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
});
