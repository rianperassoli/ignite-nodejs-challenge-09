
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { User } from "../../entities/User";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  });

  it("should be able to show an user profile", async () => {
    const passwordText = "12345"

    const user = await createUserUseCase.execute({
      email: "test@email.com",
      password: passwordText,
      name: "User Test",
    });

    const result = await showUserProfileUseCase.execute(user.id as string);

    expect(result).toHaveProperty("id");
    expect(result).toBeInstanceOf(User);
  });

  it("should not be able to show an user profile with non existing id", () => {
    expect(async () => {
      await showUserProfileUseCase.execute('incorrect ID');
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });

});
