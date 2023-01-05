import * as UserClass from "../models/User";
import { ErrorMsgEnum } from "../factory/ErrMsg";


export async function ChargeUserVal(req:any,res:any,next:any)  {
    try{
        req.body.username_admin = req.user;
        if(typeof req.body.destination_user =="string" && (Number.isInteger(req.body.value)) && req.body.value>0 ){
            let responseVal = await UserClass.TokenChargeVal(req.body);
            responseVal === true ? next() : next(responseVal)
        }else{
            next(ErrorMsgEnum.BadPayloadFormat)
        }
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
};

