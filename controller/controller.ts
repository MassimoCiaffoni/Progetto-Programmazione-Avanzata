// Import libraries
require('dotenv').config();
import { DBConnection } from "../singleton/DBConnection";
import {QueryTypes, Sequelize, where} from 'sequelize';
import { User } from "../models/User";
import {ErrorMsgEnum, getErrorMsg} from "../factory/ErrMsg";
import { SuccessMsgEnum, getSuccessMsg } from "../factory/SuccMsg";
import * as GameClass from "../models/Game";
import * as UserClass from "../models/User";
import { Grid } from "../utils/Grid";


const sequelize: Sequelize = DBConnection.getInstance();

export function controllerErrors(error:any,res: any) {
    const new_err_msg = getErrorMsg(ErrorMsgEnum.InternalServerError).getMsg();
    res.status(new_err_msg.status).json(new_err_msg);
}


export async function CreateNewGame(req: any, res: any): Promise<void>{
    try {
        console.log("Dentro Create Game")
        console.log(req.body.ships)
        for (var i = 0; i < req.body.ships.length; i++){
            console.log(req.body.ships[i].size)
        }
        await GameClass.Game.create(req.body).then((game: any) => {
            //UserClass.User.update({on_game: true},{ where: {email: req.body.creator}})
            //UserClass.User.update({on_game: true},{ where: {email: req.body.opponent}})
            const response=  getSuccessMsg(SuccessMsgEnum.NewGame).getMsg();
            res.header("Content-Type", "application/json");
            res.status(response.status).json({Message: response, Value:req.body.value})
        });
    } catch(error) {
        console.log(error)
        controllerErrors(error,res);
    }
    
}

export async function ChargeUser(req: any, res: any) {
    try {        
        await User.increment(['tokens'], { by: req.body.value, where: { email: req.body.destination_user } })
        let data = { "value": req.body.value };
        const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
        res.header("Content-Type", "application/json");
        res.status(response.status).json({Message: response, Value:req.body.value})

    }
    catch(error) {
        controllerErrors(error,res);
    }
}

export async function CheckGameStatus(req: any, res:any){
    const id = req.params.id;
    console.log("Dentro Check Game")
    console.log(id)
    try {
    let state = await GameClass.Game.findOne({
        attributes : ['state','game_type','winner'],
        where: {game_id: id}
    });
    console.log(state?.toJSON())
    const response  = getSuccessMsg(SuccessMsgEnum.CorrectState).getMsg();
    res.header("Content-Type", "application/json");
    res.status(response.status).json({Message: response, Value:state?.toJSON()})
    }
    catch(error) {
        console.log(error)
        controllerErrors(error,res); 
    }
}

export async function UseMove(req: any, res: any) {
    try{
        await User.decrement(['tokens'], {by: 0.015, where: {email: req.body.user.email}});
        {
            GameClass.Game.update({state: 'Finished'},{where: {game_id: req.params}})
        }
    }
    catch(error) {
        controllerErrors(error,res); 
    }
}

