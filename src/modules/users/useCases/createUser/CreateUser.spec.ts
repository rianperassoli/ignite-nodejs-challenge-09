
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user = {
      name: "User Test",
      email: "test@email.com",
      password: "12345",
    };

    const newUser = await createUserUseCase.execute(user);

    expect(newUser).toHaveProperty("id");
  });

  it("should not be able to create a new user with existent email", () => {
    expect(async () => {
      const user = {
        name: "User Test",
        email: "test@email.com",
        password: "12345",
      };

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);

    }).rejects.toBeInstanceOf(CreateUserError)
  });
});
