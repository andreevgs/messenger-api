import { Request } from 'express';
import { User } from "../schemas/user.schema";

export interface UserRequestInterface extends Request {
  user?: User;
}
