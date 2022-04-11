import { Statement } from "../../entities/Statement";

export type ICreateTransferDTO =
  Pick<
    Statement,
    'description' |
    'amount' |
    'sender_id' |
    'user_id' |
    'type'
  >
