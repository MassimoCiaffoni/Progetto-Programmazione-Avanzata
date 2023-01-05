// Import libraries
require('dotenv').config();
import { DBConnection } from "../singleton/DBConnection";
import {QueryTypes, Sequelize} from 'sequelize';
import { User } from "../models/User";
import {ErrorMsgEnum, getErrorMsg} from "../factory/ErrMsg";
import { SuccessMsgEnum, getSuccessMsg } from "../factory/SuccMsg";


const sequelize: Sequelize = DBConnection.getInstance();

export function controllerErrors(error:any,res: any) {
    const new_err_msg = getErrorMsg(ErrorMsgEnum.InternalServerError).getMsg();
    res.status(new_err_msg.status).json(new_err_msg);
}

export async function ChargeUser(req: any, res: any) {
    try {
        await User.increment(['tokens'], { by: req.body.value, where: { username: req.body.destination_user } })
        let data = { "value": req.body.value };
        const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
        res.header("Content-Type", "application/json");
        res.status(response.status).json({Message: response, Value:req.body.value})

    }
    catch(error) {
        controllerErrors(error,res);
    }
}

