import {Msg} from "./Msg";
const {StatusCode} = require('status-code-enum')

class AppStarted implements Msg{
    getMsg(): { status: number; msg: string; } {
        return{
            status: StatusCode.SuccessOK,
            msg: "Success OK - App was successfully launched"
        }
    }
}

class CorrectCharge implements  Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Tokens succesfully charged"
        }
    }
}


class NewGame implements  Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - Game succesfully created"
        }
    }
}

class CorrectState implements  Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - State succesfully extracted"
        }
    }
}

class Winner implements  Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "You have won the game!"
        }
    }
}



export enum SuccessMsgEnum {
    AppStarted,
    CorrectCharge,
    NewGame,
    CorrectState,
    Winner,
}

/**
 * Function 'getSuccessMsg'
 * 
 * Function invoked by the controller when successfully ending a route.
 * 
 * @param type Type of the success message obtained one of the values of the {@link SuccessMsgEnum}
 * @returns An object of the {@link Msg} interface representing a success message.
 */
export function getSuccessMsg(type: SuccessMsgEnum): Msg{
    let corrmsg: Msg;
    switch(type){
        case SuccessMsgEnum.AppStarted:
            corrmsg = new AppStarted();
            break;
        case SuccessMsgEnum.CorrectCharge:
            corrmsg = new CorrectCharge();
            break;  
        case SuccessMsgEnum.NewGame:
            corrmsg = new NewGame();
            break;
        case SuccessMsgEnum.CorrectState:
            corrmsg = new CorrectState();
            break;
        case SuccessMsgEnum.Winner:
            corrmsg = new Winner();
            break;
    }
    return corrmsg;
}