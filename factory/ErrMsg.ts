// Import libraries
import {Msg} from "./Msg";
const {StatusCode} = require('status-code-enum')


class MissingToken implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Request header undefined: missing JWT Token"
        }
    }
}

class NoHeader implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - No request authorization header"
        }
    }
}

class BadPayloadFormat implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Formatting Error: user data in payload are bad formatted"
        }
    }
}

class InvalidToken implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorForbidden,
            msg: "Forbidden - Authentication Error: invalid JWT Token"
        }
    }
}

class InternalServerError implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ServerErrorInternal,
            msg: "Internal Server Error"
        }
    }
}

class UserNotFound implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ServerErrorInternal,
            msg: 'User not exist'
        }
    }
}


class UserNotAdmin implements Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.ClientErrorUnauthorized,
            msg: "Forbidden - Authorization Error: you are not authorized"
        }
    }
}


export enum ErrorMsgEnum {
    MissingToken,
    NoHeader,
    InvalidToken,
    BadPayloadFormat,
    InternalServerError,
    UserNotFound,
    UserNotAdmin,
}


export function getErrorMsg(type: ErrorMsgEnum): Msg{
    let msgerr: Msg;
    switch(type){
        case ErrorMsgEnum.MissingToken:
            msgerr = new MissingToken();
            break;
        case ErrorMsgEnum.NoHeader:
            msgerr = new NoHeader();
            break;
        case ErrorMsgEnum.InvalidToken:
            msgerr = new InvalidToken();
            break;
        case ErrorMsgEnum.BadPayloadFormat:
            msgerr = new BadPayloadFormat();
            break;
        case ErrorMsgEnum.InternalServerError:
            msgerr = new InternalServerError();
            break;
        case ErrorMsgEnum.UserNotFound:
            msgerr = new UserNotFound();
            break;
        case ErrorMsgEnum.UserNotAdmin:
            msgerr = new UserNotAdmin();
            break;
    }
    return msgerr;
}