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
            msg: "Bad Request - Formatting Error: user data in the JWT payload are bad formatted"
        }
    }
}

class BadBodyFormat implements Msg{
    getMsg(): { status: number,  msg: string } {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: "Bad Request - Formatting Error: data in your body request are bad formatted"
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

class WrongMode implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'This game mode dont exist'
        }
    }
}


class OnGame implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'At least on player is already on game'
        }
    }
}


class WrongOpponent implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'You cant specify this opponent on this game mode'
        }
    }
}
class GameNotExists implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'Game Not exist'
        }
    }
}

class NoTokens implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'You dont have enough tokens to create the game'
        }
    }
}

class CannotPlace implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'It is impossible to place that list of ships in grid of given size'
        }
    }
}
class CoordinatesNotValid implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'Your Coordinates are not valid'
        }
    }
}

class NotTurn implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'It is not your turn'
        }
    }
}

class NotCurrentPlayer implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'You are not a player of this game'
        }
    }
}

class SilentFinished implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'You have finished your silences moves'
        }
    }
}

class SilentError implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'You cant play silent mode on singleplayer'
        }
    }
}

class SilentModeNotActivated implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'This game is not in silent mode'
        }
    }
}

class SilentIsNotZero implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'You must specify silences at 0 if you wanna create game with this options'
        }
    }
}

class AlreadyHitError implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'You have already tried this coordinates'
        }
    }
}

class GameFinished implements Msg{
    getMsg(): {status: number, msg: string} {
        return {
            status: StatusCode.ClientErrorBadRequest,
            msg: 'This game is finished see winner on /id/state'
        }
    }
}

export enum ErrorMsgEnum {
    MissingToken,
    NoHeader,
    InvalidToken,
    BadBodyFormat,
    BadPayloadFormat,
    InternalServerError,
    UserNotFound,
    UserNotAdmin,
    WrongMode,
    OnGame,
    WrongOpponent,
    GameNotExists,
    NoTokens,
    CannotPlace,
    CoordinatesNotValid,
    NotTurn,
    NotCurrentPlayer,
    SilentError,
    SilentFinished,
    SilentModeNotActivated,
    SilentIsNotZero,
    AlreadyHitError,
    GameFinished,
}

/**
 * Function 'getErrorMsg'
 * 
 * Function invoked by the Chain of Responsability middleware layers or controller when a route ends with an error.
 * 
 * @param type Type of the error message obtained one of the values of the {@link ErrorMsgEnum}
 * @returns An object of the {@link Msg} interface representing an error message. 
 */

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
        case ErrorMsgEnum.BadBodyFormat:
            msgerr = new BadBodyFormat();
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
        case ErrorMsgEnum.WrongMode:
            msgerr = new WrongMode();
            break;
        case ErrorMsgEnum.OnGame:
            msgerr = new OnGame;
            break;
        case ErrorMsgEnum.WrongOpponent:
            msgerr = new WrongOpponent();
            break;
        case ErrorMsgEnum.GameNotExists:
            msgerr = new GameNotExists();
            break;
        case ErrorMsgEnum.NoTokens:
            msgerr = new NoTokens();
            break;
        case ErrorMsgEnum.CannotPlace:
            msgerr = new CannotPlace();
            break;
        case ErrorMsgEnum.CoordinatesNotValid:
            msgerr = new CoordinatesNotValid();
            break;
        case ErrorMsgEnum.NotTurn:
            msgerr = new NotTurn();
            break;
        case ErrorMsgEnum.NotCurrentPlayer:
            msgerr = new NotCurrentPlayer();
            break;
        case ErrorMsgEnum.SilentError:
            msgerr = new SilentError;
            break;
        case ErrorMsgEnum.SilentFinished:
            msgerr = new SilentFinished();
            break;
        case ErrorMsgEnum.SilentModeNotActivated:
            msgerr = new SilentModeNotActivated();
            break;
        case ErrorMsgEnum.SilentIsNotZero:
            msgerr = new SilentIsNotZero();
            break;
        case ErrorMsgEnum.AlreadyHitError:
            msgerr = new AlreadyHitError();
            break;
        case ErrorMsgEnum.GameFinished:
            msgerr = new GameFinished();
            break;
    }
    return msgerr;
}