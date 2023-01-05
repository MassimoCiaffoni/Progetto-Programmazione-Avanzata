import {Msg} from "./Msg";
const {StatusCode} = require('status-code-enum')


class CorrectCharge implements  Msg{
    getMsg(): { status: number; msg: string; } {
        return {
            status: StatusCode.SuccessOK,
            msg: "Success OK - No doses of the required vaccine are currently available"
        }
    }
}


export enum SuccessMsgEnum {
    CorrectCharge,
}


export function getSuccessMsg(type: SuccessMsgEnum): Msg{
    let corrmsg: Msg;
    switch(type){
        case SuccessMsgEnum.CorrectCharge:
            corrmsg = new CorrectCharge();
            break;  
    }
    return corrmsg;
}