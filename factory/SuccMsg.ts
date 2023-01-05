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

export enum SuccessMsgEnum {
    AppStarted,
    CorrectCharge,
    NewGame,
    CorrectState,
}


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
    }
    return corrmsg;
}