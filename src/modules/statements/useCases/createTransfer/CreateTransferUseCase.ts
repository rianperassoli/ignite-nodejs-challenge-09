import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTranferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";
import { OperationType } from "../../entities/Statement";

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ user_id, sender_id, amount, description, type }: ICreateTransferDTO) {
    if (!amount || (amount <= 0)) {
      throw new CreateTransferError.InvalidAmount();
    }

    const [user, sender] = await Promise.all([
      this.usersRepository.findById(user_id),
      this.usersRepository.findById(sender_id)
    ])

    if (!user) {
      throw new CreateTransferError.UserNotFound();
    }

    if (!sender) {
      throw new CreateTransferError.SenderNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (!balance || (balance < amount)) {
      throw new CreateTransferError.InsufficientFunds()
    }

    const transferOperationDebit = await this.statementsRepository.create({
      user_id: sender_id,
      type,
      amount: (amount * -1),
      description
    });

    const transferOperationCredit = await this.statementsRepository.createTransfer({
      sender_id,
      user_id,
      type,
      amount,
      description
    });

    return transferOperationCredit;
  }
}
