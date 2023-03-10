import * as UserClass from "../models/User";
import {getErrorMsg,ErrorMsgEnum } from "../factory/ErrMsg";
import * as GameClass from "../models/Game";
import * as Grid from '../utils/Grid';
import { Sequelize } from "sequelize";
import { SinglePlayerEnum, MultiPlayerEnum } from "../utils/Modes";



/**
 * Middleware layer 'ChargeUserVal'
 * 
 * Check if the JSON body of charge route is correct. 
 * The function check value types and control if users exists and request is valid (user is admin).
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
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

/**
 * Middleware layer 'GameVal'
 * 
 * Check if the Game can be created.
 * The function check creator type and values relations.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function GameVal(req:any,res:any,next:any)  {
    try{
        req.body.creator = req.user.email;
        if(typeof req.body.creator =="string"){
            let responseVal = await GameClass.CreateGameVal(req.body);
            responseVal === true ? next() : next(responseVal)
        }else{
            next(ErrorMsgEnum.BadPayloadFormat)
        }
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
};

/**
 * Middleware layer 'PlyersVal'
 * 
 * Check if the players of a new game are already occupied in an existing game.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function PlayersVal(req:any,res:any,next:any) {
    try{
        if (req.body.game_type in MultiPlayerEnum){
            let creatorflag =await UserClass.User.findOne({
                attributes : ['on_game'],
                where: {email:req.body.creator}
            })
            let opponent_flag=await UserClass.User.findOne({
                attributes : ['on_game'],
                where: {email:req.body.opponent}
            })
            if (creatorflag?.toJSON().on_game || opponent_flag?.toJSON().on_game){
                const new_err_msg = getErrorMsg(ErrorMsgEnum.OnGame).getMsg();
                res.status(new_err_msg.status).json(new_err_msg);
            }
            else{
                next()
            }
        }            
        else if (req.body.game_type in SinglePlayerEnum){
            let creatorflag = await UserClass.User.findOne({
                attributes : ['on_game'],
                where: {email:req.body.creator}
            }).then((user: any)=>{
                if (user.on_game){
                    const new_err_msg = getErrorMsg(ErrorMsgEnum.OnGame).getMsg();
                    res.status(new_err_msg.status).json(new_err_msg);
                }
                else{
                    next()
                }

            });
        }
        else{
            next(ErrorMsgEnum.WrongMode);
        }
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
}

/**
 * Middleware layer 'BodyNewGame'
 * 
 * Check if the creator has enough tokens to create a new game.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function PlayerToken(req:any,res:any,next:any) {
    try{
        await UserClass.User.findOne({
            attributes : ['tokens'],
            where: {email:req.body.creator}
        }).then((user: any)=>{
            if(user.tokens < 0.35){
                const new_err_msg = getErrorMsg(ErrorMsgEnum.NoTokens).getMsg();
                res.status(new_err_msg.status).json(new_err_msg);
            }
        else{
            next();
        }
        });
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
}

/**
 * Middleware layer 'GameExistence'
 * 
 * Check if game data requested (state or history) exist in the database.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function GameExistence(req:any,res:any,next:any) {
    try{
        let itExist = await GameClass.Game.findOne({
            where: {game_id: req.params.id}
        });
        if (itExist){
            next()
        }
        else{
            next(ErrorMsgEnum.GameNotExists)
        }
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }    
}


/**
 * Middleware layer 'PlaceShipVal'
 * 
 * Check if the array of ships on the request body can be placed on the board size of the request body.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function PlaceShipVal(req:any,res:any,next:any) {
    try{
        if (Grid.canPlaceShips(req.body.grid_size, req.body.ships)) {
            next();
        } else {
            next(ErrorMsgEnum.CannotPlace);
        }
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
}

/**
 * Middleware layer 'CoordinatesVal'
 * 
 * Check if the JSON body of attack is correct controlling if the coordinates exists on the board.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function CoordinatesVal(req:any,res:any,next:any) {
    try{
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
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }    
}


/**
 * Middleware layer 'TurnVal'
 * 
 * Check if the player requesting the attack is the one on turn in the game.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function TurnVal(req:any,res:any,next:any) {
    try{
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
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }    
}

/**
 * Middleware layer 'CheckUserOnGame'
 * 
 * Check if the player requesting an attack, state or history of the game is one of the two players.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function CheckUserOnGame(req:any,res:any,next:any) {
    try{
        req.body.player = req.user.email;
        await GameClass.Game.findOne({
            attributes: ['creator', 'opponent'],
            where: {game_id: req.params.id}
        }).then((game)=>{
            if (game.creator.name == req.body.player || game.opponent.name == req.body.player){
                next()
            }
            else{
                next(ErrorMsgEnum.NotCurrentPlayer)
            }        
        });
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }   
}

/**
 * Middleware layer 'CheckMode'
 * 
 * Check if a player can use a silence move and decrement his silences moves. 
 * If the mode is not setted or the silences are finished return an {@link ErrorMsgEnum}. 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function CheckMode(req:any,res:any,next:any) {
    try{
        console.log(req.params.id)
        await GameClass.Game.findOne({
            where: {game_id: req.params.id}
        }).then((game: any)=>{
            if (game.game_type in SinglePlayerEnum && req.body.silence == true){
                next(ErrorMsgEnum.SilentError)
            }
            else if(game.game_type in MultiPlayerEnum && req.body.silence == true && game.silent_mode==false){
                next(ErrorMsgEnum.SilentModeNotActivated)
            }
            else if(game.game_type in MultiPlayerEnum  && req.body.silence == true && game.silent_mode==true){
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
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
}


/**
 * Middleware layer 'AttackAlreadyDone'
 * 
 * Check if the player attack has been done already once.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function AttackAlreadyDone(req:any,res:any,next:any) {
    try{
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
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
}

/**
 * Middleware layer 'BodyNewGame'
 * 
 * Check if the game is already finished so a player cannot do more attacks.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function CheckGameState(req:any,res:any,next:any) {
    try{
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
    }catch(error){
        next(ErrorMsgEnum.InternalServerError)
    }
}
