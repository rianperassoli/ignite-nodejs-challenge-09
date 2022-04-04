
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const passwordText = "12345"

    const user = await createUserUseCase.execute({
      email: "test@email.com",
      password: passwordText,
      name: "User Test",
    });

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: passwordText,
    });

    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
  });

  it("should not be able to authenticate an user with non existing email", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'testemail@email.com',
        password: 'password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it("should not be able to authenticate an user with wrong password", () => {
    expect(async () => {
      const passwordText = "12345"

      const user = await createUserUseCase.execute({
        email: "test@email.com",
        password: passwordText,
        name: "User Test",
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: passwordText + passwordText,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });


});
