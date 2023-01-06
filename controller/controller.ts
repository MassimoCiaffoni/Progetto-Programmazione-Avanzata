// Import libraries
require('dotenv').config();
import { DBConnection } from "../singleton/DBConnection";
import {QueryTypes, Sequelize, where} from 'sequelize';
import { User } from "../models/User";
import {ErrorMsgEnum, getErrorMsg} from "../factory/ErrMsg";
import { SuccessMsgEnum, getSuccessMsg } from "../factory/SuccMsg";
import * as GameClass from "../models/Game";
import * as UserClass from "../models/User";
import * as Grid from "../utils/Grid";


const sequelize: Sequelize = DBConnection.getInstance();

export function controllerErrors(error:any,res: any) {
    const new_err_msg = getErrorMsg(ErrorMsgEnum.InternalServerError).getMsg();
    res.status(new_err_msg.status).json(new_err_msg);
}


export async function CreateNewGame(req: any, res: any): Promise<void>{
    try {
        await GameClass.Game.create({game_type: req.body.game_type, silent_mode: req.body.silent_mode, creator: {name: req.body.creator, silence: req.body.silences}, 
            opponent: {name: req.body.opponent, silence: req.body.silences}, grid_size: req.body.grid_size})
        .then((game: any) => {
            let creatorgrid = Grid.placeShips(req.body.grid_size,Grid.generateBoard(req.body.grid_size),req.body.ships)
            let opponentgrid= Grid.placeShips(req.body.grid_size,Grid.generateBoard(req.body.grid_size),req.body.ships)
            console.log("Controllo Differenze")
            console.log(creatorgrid)
            console.log(opponentgrid)
            game.update({creator_grid: creatorgrid, opponent_grid: opponentgrid});
            UserClass.User.update({on_game: true},{ where: {email: req.body.creator}})
            UserClass.User.decrement(['tokens'], {by: 0.35, where: {email: req.body.creator}})
            UserClass.User.update({on_game: true},{ where: {email: req.body.opponent}})
            const response=  getSuccessMsg(SuccessMsgEnum.NewGame).getMsg();
            res.header("Content-Type", "application/json");
            res.status(response.status).json({Message: response, ID:game.game_id})
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
    try {
    let state = await GameClass.Game.findOne({
        attributes : ['state','game_type','winner','turn'],
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
        //CONTROLLO SE IL PLAYER E' IA O REALE SE IA  NON DECREMENTO NESSUN TOKENS
        console.log("Dentro il Controller della Move")
        let silence = req.body.silence;
        console.log(silence)
        User.decrement(['tokens'], {by: 0.015, where: {email: req.body.player}}); 
        await GameClass.Game.findOne({where: {game_id: req.params.id}}).then((game)=>{
            if(game.game_type=="multiplayer"){
                if (req.body.player == game.creator.name){
                    // Inserire attacco del creator modificando la board dell'opponent
                    console.log("Provo a modificare")
                    console.log(game.opponent_grid.board)
                    Grid.markHit(req.body.x, req.body.y,game.opponent_grid.board);
                    console.log(game.opponent_grid.board)
                    GameClass.Game.update({opponent_grid: game.opponent_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.opponent.name},{where: {game_id: req.params.id}})
                    if(Grid.checkShip(req.body.x, req.body.y,game.opponent_grid.board)){
                        if (Grid.isGameFinished(game.opponent_grid.board)){
                            GameClass.Game.update({state: 'Finished', winner: game.creator.name},{where: {game_id: req.params.id}})
                            UserClass.User.update({on_game: false},{where: {email: game.creator.name}})
                            UserClass.User.update({on_game: false},{where: {email: game.opponent.name}})
                            const response  = getSuccessMsg(SuccessMsgEnum.Winner).getMsg();
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: response})
                        }
                        else{
                            const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg(); //modifica con messaggio corretto ship hitted
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: "Ship hitted", Value:req.body.value})
                        }
                    }
                    else{
                        const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
                        res.header("Content-Type", "application/json");
                        res.status(response.status).json({Message: "You didnt hit the enemy ship", Value:req.body.value})
                    }
                }
                else if (req.body.player == game.opponent.name){
                    // Inserisco attacco dell'opponent
                    console.log("Provo a modificare")
                    console.log(game.creator_grid.board)
                    Grid.markHit(req.body.x, req.body.y,game.creator_grid.board);
                    console.log(game.creator_grid.board)
                    GameClass.Game.update({creator_grid: game.creator_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.creator.name},{where: {game_id: req.params.id}})
                    if(Grid.checkShip(req.body.x, req.body.y,game.creator_grid.board)){
                        if (Grid.isGameFinished(game.creator_grid.board)){
                            GameClass.Game.update({state: 'Finished', winner: game.opponent.name},{where: {game_id: req.params.id}})
                            UserClass.User.update({on_game: false},{where: {email: game.creator.name}})
                            UserClass.User.update({on_game: false},{where: {email: game.opponent.name}})
                            const response  = getSuccessMsg(SuccessMsgEnum.Winner).getMsg();
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: response})
                        }
                        else{
                            const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: "Ship hitted", Value:req.body.value})
                        }
                    }
                    else{
                        const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
                        res.header("Content-Type", "application/json");
                        res.status(response.status).json({Message: "You didnt hit the enemy ship", Value:req.body.value})
                    }
                }
            }
        });

    }   
    catch(error) {
        controllerErrors(error,res); 
    }
}


