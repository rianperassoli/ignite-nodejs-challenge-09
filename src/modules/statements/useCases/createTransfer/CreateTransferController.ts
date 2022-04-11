import { Request, Response } from 'express';
import { OperationType } from '../../entities/Statement';
import { container } from 'tsyringe';

import { CreateTransferUseCase } from './CreateTransferUseCase';

export class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const createTransfer = container.resolve(CreateTransferUseCase);

    const type = OperationType.TRANSFER

    const transfer = await createTransfer.execute({
      sender_id,
      user_id,
      amount,
      description,
      type
    });

    return response.status(201).json(transfer);
  }
}
