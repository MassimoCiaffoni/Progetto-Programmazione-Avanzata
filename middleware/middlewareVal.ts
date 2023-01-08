import * as UserClass from "../models/User";
import {getErrorMsg,ErrorMsgEnum } from "../factory/ErrMsg";
import * as GameClass from "../models/Game";
import * as Grid from '../utils/Grid';
import { Sequelize } from "sequelize";




export async function ChargeUserVal(req:any,res:any,next:any)  {
    try{
        req.body.username_admin = req.user;
        if(typeof req.body.destination_user =="string" && typeof req.body.value=="number" && req.body.value>0 ){
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

export async function PlayerToken(req:any,res:any,next:any) {
    let creatortokens = await UserClass.User.findOne({
        attributes : ['tokens'],
        where: {email:req.body.creator}
    });
    if (creatortokens?.toJSON().tokens < 0.35){
            const new_err_msg = getErrorMsg(ErrorMsgEnum.NoTokens).getMsg();
            res.status(new_err_msg.status).json(new_err_msg);
        }
    else{
        next();
    }
}
 
export async function GameExistence(req:any,res:any,next:any) {
    console.log("Dentro Game Existence")
    let itExist = await GameClass.Game.findOne({
        where: {game_id: req.params.id}
    });
    if (itExist){
        next()
    }
    else{
        next(ErrorMsgEnum.GameNotExists)
    }
    
}



export async function PlaceShipVal(req:any,res:any,next:any) {
    if (Grid.canPlaceShips(req.body.grid_size, req.body.ships)) {
        next();
      } else {
        next(ErrorMsgEnum.CannotPlace);
      }
}


export async function CoordinatesVal(req:any,res:any,next:any) {
    let x: number = req.body.x
    let y: number = req.body.y
    await GameClass.Game.findOne({
        attributes : ['grid_size'],
        where: {game_id: req.params.id}
    }).then((game: any) =>{
        let size: number =game.grid_size;
        if (!Grid.isValidAttack(size,x,y)){
            next(ErrorMsgEnum.CoordinatesNotValid)
        }
        else{
            next()
        }
    });

    
}
export async function TurnVal(req:any,res:any,next:any) {
    await GameClass.Game.findOne({
        attributes : ['turn'],
        where: {game_id:req.params.id}
    }).then((game: any)=>{
        if(game.turn == req.body.player){
            next()
        }
        else{
            next(ErrorMsgEnum.NotTurn)
        }
    });
    
}

export async function CheckUserOnGame(req:any,res:any,next:any) {
    req.body.player = req.user.email;
    let game= await GameClass.Game.findOne({
        attributes: ['creator', 'opponent'],
        where: {game_id: req.params.id}
    });
    if (game?.toJSON().creator.name == req.body.player || game?.toJSON().opponent.name == req.body.player){
        next()
    }
    else{
        next(ErrorMsgEnum.NotCurrentPlayer)
    }
}


export async function CheckMode(req:any,res:any,next:any) {
    console.log(req.params.id)
    await GameClass.Game.findOne({
        where: {game_id: req.params.id}
    }).then((game: any)=>{
        if (game.game_type == 'singleplayer' && req.body.silence == true){
            next(ErrorMsgEnum.SilentError)
        }
        else if(game.game_type == 'multiplayer' && req.body.silence == true && game.silent_mode==false){
            next(ErrorMsgEnum.SilentModeNotActivated)
        }
        else if(game.game_type == 'multiplayer' && req.body.silence == true && game.silent_mode==true){
            let current_creator= game.creator.name;
            let current_opponent= game.opponent.name;
            if(req.body.player==current_creator){
                if(game.creator_silent >0){
                    GameClass.Game.decrement(['creator_silent'],{by:1, where: {game_id: req.params.id}});
                    console.log("Silent decrementato")
                    next()
                }
                else{
                    next(ErrorMsgEnum.SilentFinished)
                }
            }
            else if(req.body.player==current_opponent){
                if(game.opponent_silent >0){
                    GameClass.Game.decrement(['opponent_silent'],{by:1, where: {game_id: req.params.id}});
                    next()
                }
                else{
                    next(ErrorMsgEnum.SilentFinished)
                }
            }
        }
        else{
                next()
            }
            
    });
}
    
export async function AttackAlreadyDone(req:any,res:any,next:any) {
    await GameClass.Game.findOne({
        where: {game_id: req.params.id}
    }).then((game: any)=>{
        if(req.body.player==game.creator.name){
            let opponentboard=game.opponent_grid.board;
            console.log(opponentboard);
            if(Grid.alreadyHit(req.body.x,req.body.y,opponentboard)){
                next(ErrorMsgEnum.AlreadyHitError)
            }
            else{
                next()
            }
        }
        else if(req.body.player==game.opponent.name){
            let creatorboard=game.creator_grid.board;
            console.log(creatorboard);
            if(Grid.alreadyHit(req.body.x,req.body.y,creatorboard)){
                next(ErrorMsgEnum.AlreadyHitError)
            }
            else{
                next()
            }
        }

    })
}


export async function CheckGameState(req:any,res:any,next:any) {
    await GameClass.Game.findOne({
        where: {game_id: req.params.id}
    }).then((game: any)=>{
        if(game.state == "Finished"){
            next(ErrorMsgEnum.GameFinished)
        }
        else{
            next()
        }
    });

}
