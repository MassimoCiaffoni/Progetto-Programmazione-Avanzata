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


export enum SuccessMsgEnum {
    AppStarted,
    CorrectCharge,
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
    }
    return corrmsg;
}