import { Request } from "express"
import { IUser } from "./model/User";
export interface IGetUserAuthInfoRequest extends Request {
    oidc?: {
        user?: IUser; // Using the appropriate UserInfo type from the library
    };
}