import { TUser } from "../modules/users/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: TUser; // Optional custom user type
    }
  }
}