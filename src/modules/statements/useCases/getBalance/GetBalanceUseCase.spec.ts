import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
  });

  it("should be able to get the balance from an user", async () => {

    const user = await usersRepositoryInMemory.create({
      name: 'User Test',
      email: 'usertest@email.com',
      password: '12345',
    })

    const user_id = user.id as string

    await statementsRepositoryInMemory.create({
      user_id,
      amount: 15.00,
      description: 'Test of deposit',
      type: OperationType.DEPOSIT,
    });

    await statementsRepositoryInMemory.create({
      user_id,
      amount: 5.00,
      description: 'Test of withdraw',
      type: OperationType.WITHDRAW,
    });

    const { balance, statement } = await getBalanceUseCase.execute({ user_id })

    expect(balance).toBe(10.00);
    expect(statement.length).toBe(2)
  });

  it("should not be able to get the balance with a non existent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'Invalid user' })
    }).rejects.toBeInstanceOf(GetBalanceError)
  });
});
