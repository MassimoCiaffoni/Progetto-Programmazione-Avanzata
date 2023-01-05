import * as UserClass from "../models/User";
import {getErrorMsg,ErrorMsgEnum } from "../factory/ErrMsg";
import * as GameClass from "../models/Game";
import { checkGame } from './CoR';


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


export async function GameVal(req:any,res:any,next:any)  {
    try{
        req.body.creator = req.user.email;
        if(typeof req.body.creator =="string" && typeof req.body.opponent =="string" ){
            let responseVal = await GameClass.CreateGameVal(req.body);
            responseVal === true ? next() : next(responseVal)
        }else{
            next(ErrorMsgEnum.BadPayloadFormat)
        }
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
};

export async function PlayersVal(req:any,res:any,next:any) {
    if (req.body.game_type == "multiplayer"){
        let creatorflag = await UserClass.User.findOne({
            attributes : ['on_game'],
            where: {email:req.body.creator}
        });
        let opponentflag = await UserClass.User.findOne({
            attributes : ['on_game'],
            where: {email:req.body.opponent}
        });
        console.log(creatorflag?.toJSON())
        console.log(opponentflag?.toJSON())
        if (creatorflag?.toJSON().on_game || opponentflag?.toJSON().on_game){
            const new_err_msg = getErrorMsg(ErrorMsgEnum.OnGame).getMsg();
            res.status(new_err_msg.status).json(new_err_msg);
        }
        else{
            next();
        }
    }
    else if (req.body.game_type == "singleplayer"){
        let creatorflag = await UserClass.User.findOne({
            attributes : ['on_game'],
            where: {email:req.body.creator}
        });
        console.log(creatorflag?.toJSON())
        if (creatorflag?.toJSON().on_game){
            const new_err_msg = getErrorMsg(ErrorMsgEnum.OnGame).getMsg();
            res.status(new_err_msg.status).json(new_err_msg);
        }
        else{
            next();
        }
    }
    else{
        next(ErrorMsgEnum.WrongMode);
    }
    
}

export async function GameExistence(req:any,res:any,next:any) {
    let itExist = await GameClass.Game.findOne({
        where: {game_id: req.params.id}
    });
    console.log(itExist)
    if (itExist){
        next()
    }
    else{
        next(ErrorMsgEnum.GameNotExists)
    }
    
}

