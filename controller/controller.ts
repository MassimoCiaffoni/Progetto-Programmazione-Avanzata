// Import libraries
require('dotenv').config();
import { DBConnection } from "../singleton/DBConnection";
import {Sequelize} from 'sequelize';
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
        await GameClass.Game.create({game_type: req.body.game_type, silent_mode: req.body.silent_mode, creator: {name: req.body.creator, silent_use: false}, 
            opponent: {name: req.body.opponent,silent_use: false}, creator_silent: req.body.silences, opponent_silent: req.body.silences, grid_size: req.body.grid_size, moves: []})
        .then((game: any) => {
            let creatorgrid = Grid.placeShips(req.body.grid_size,Grid.generateBoard(req.body.grid_size),req.body.ships)
            let opponentgrid= Grid.placeShips(req.body.grid_size,Grid.generateBoard(req.body.grid_size),req.body.ships)
            game.update({creator_grid: creatorgrid, opponent_grid: opponentgrid});
            UserClass.User.update({on_game: true},{ where: {email: req.body.creator}})
            UserClass.User.decrement(['tokens'], {by: 0.35, where: {email: req.body.creator}})
            if(req.body.opponent!=="AI"){
                UserClass.User.update({on_game: true},{ where: {email: req.body.opponent}})
            }
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
        User.increment(['tokens'], { by: req.body.value, where: { email: req.body.destination_user } })
        const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
        res.header("Content-Type", "application/json");
        res.status(response.status).json({Message: response, Value:req.body.value})

    }
    catch(error) {
        controllerErrors(error,res);
    }
}

export async function GetGameStatus(req: any, res:any){
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


export async function GetHistory(req: any, res:any){
    const id = req.params.id;
    try {
    await GameClass.Game.findOne({
        attributes : ['moves'],
        where: {game_id: id}
    }).then((game)=>{
        const moves = game.moves;
        const fields = Object.keys(moves[0]);
        const csv = moves.map((row: any) => fields.map((fieldname:any) => JSON.stringify(row[fieldname])).join(','))// => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(fields.join(','));
        let message =csv.join('\r\n');
        res.header("Content-Type", "text/csv");
        res.header("Content-Disposition", 'attachment; filename="data.csv"');
        res.send(message)
    });
    }
    catch(error) {
        console.log(error)
        controllerErrors(error,res); 
    }
}

export async function UseMove(req: any, res: any) {
    try{
        console.log("Dentro controller")
        let silence = req.body.silence;
        User.decrement(['tokens'], {by: 0.015, where: {email: req.body.player}}); 
        await GameClass.Game.findOne({where: {game_id: req.params.id}}).then((game: any)=>{
            if(game.game_type=="multiplayer"){
                if (req.body.player == game.creator.name){
                    if (silence){
                        console.log("Cambio silent move")
                        GameClass.Game.update({creator: {name: game.creator.name, silent_use: true}},{where: {game_id: req.params.id}})
                    }
                    Grid.markHit(req.body.x, req.body.y,game.opponent_grid.board);
                    GameClass.Game.update({opponent_grid: game.opponent_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.opponent.name},{where: {game_id: req.params.id}})
                    if(Grid.checkShip(req.body.x, req.body.y,game.opponent_grid.board)){                       
                        if (Grid.isGameFinished(game.opponent_grid.board)){
                            // inserire update dello storico delle mosse oscurate dal silence
                            let final_moves=Grid.ChangeSilentMoves(game.moves);
                            GameClass.Game.update({moves: final_moves},{where: {game_id: req.params.id}})  
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: true}))},
                                {where: {game_id: req.params.id}});
                            GameClass.Game.update({state: 'Finished', winner: game.creator.name},{where: {game_id: req.params.id}})
                            UserClass.User.update({on_game: false},{where: {email: game.creator.name}})
                            UserClass.User.update({on_game: false},{where: {email: game.opponent.name}})
                            const response  = getSuccessMsg(SuccessMsgEnum.Winner).getMsg();
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: response})
                        }
                        else{
                            if(game.opponent.silent_use){
                                GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: "silence",raw: true}))},
                                    {where: {game_id: req.params.id}});
                                GameClass.Game.update({opponent: {name: game.opponent.name,silent_use: false}},{where: {game_id: req.params.id}})
                                const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg(); //modifica con messaggio corretto ship silent                        
                                res.header("Content-Type", "application/json");
                                res.status(response.status).json({Message: "Enemy Silent Used", Value:req.body.value})
                            }
                            else{
                                GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: true}))},
                                    {where: {game_id: req.params.id}});
                                const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg(); //modifica con messaggio corretto ship hitted                          
                                res.header("Content-Type", "application/json");
                                res.status(response.status).json({Message: "Ship hitted", Value:req.body.value})
                            }
                        }
                    }
                    else{
                        if(game.opponent.silent_use){
                            // INSERIRE MOSSA ANONIMA NELL'ARRAY
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: "silence",raw:false}))},
                                {where: {game_id: req.params.id}});
                            GameClass.Game.update({opponent: {name: game.opponent.name,silent_use: false}},{where: {game_id: req.params.id}})
                            const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg(); //modifica con messaggio corretto ship silent                        
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: "Enemy Silent Used", Value:req.body.value})
                        }
                        else{
                            const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: false}))},
                                {where: {game_id: req.params.id}});
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: "You didnt hit the enemy ship", Value:req.body.value})
                        }
                    }
                }
                else if (req.body.player == game.opponent.name){
                    if (silence){
                        GameClass.Game.update({opponent: {name: game.opponent.name, silent_use: true}},{where: {game_id: req.params.id}})
                    }
                    Grid.markHit(req.body.x, req.body.y,game.creator_grid.board);
                    GameClass.Game.update({creator_grid: game.creator_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.creator.name},{where: {game_id: req.params.id}})
                    if(Grid.checkShip(req.body.x, req.body.y,game.creator_grid.board)){
                        if (Grid.isGameFinished(game.creator_grid.board)){     
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.opponent.name,hashitted: true}))},
                                {where: {game_id: req.params.id}});  
                            //inserisci funzione modifica hit del silence
                            let final_moves=Grid.ChangeSilentMoves(game.moves);
                            GameClass.Game.update({moves: final_moves},{where: {game_id: req.params.id}})                 
                            GameClass.Game.update({state: 'Finished', winner: game.opponent.name},{where: {game_id: req.params.id}})
                            UserClass.User.update({on_game: false},{where: {email: game.creator.name}})
                            UserClass.User.update({on_game: false},{where: {email: game.opponent.name}})
                            const response  = getSuccessMsg(SuccessMsgEnum.Winner).getMsg();
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: response})
                        }
                        else{
                            if(game.creator.silent_use==true){
                                GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.opponent.name,hashitted: "silence",raw:true}))},
                                    {where: {game_id: req.params.id}});
                                GameClass.Game.update({creator: {name: game.creator.name,silent_use: false}},{where: {game_id: req.params.id}})
                                const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg(); //modifica con messaggio corretto ship silent                        
                                res.header("Content-Type", "application/json");
                                res.status(response.status).json({Message: "Enemy Silent Used", Value:req.body.value})
                            }
                            else{
                                GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.opponent.name,hashitted: true}))},
                                    {where: {game_id: req.params.id}});
                                const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
                                res.header("Content-Type", "application/json");
                                res.status(response.status).json({Message: "Ship hitted", Value:req.body.value})
                            }
                        }
                    }
                    else{
                        if(game.creator.silent_use==true){
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.opponent.name,hashitted: "silence",raw:false}))},
                                {where: {game_id: req.params.id}});
                            GameClass.Game.update({creator: {name: game.creator.name,silent_use: false}},{where: {game_id: req.params.id}})
                            const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg(); //modifica con messaggio corretto ship silent                        
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: "Enemy Silent Used", Value:req.body.value})
                        }
                        else{
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.opponent.name,hashitted: false}))},
                                {where: {game_id: req.params.id}});
                            const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
                            res.header("Content-Type", "application/json");
                            res.status(response.status).json({Message: "You didnt hit the enemy ship", Value:req.body.value})
                        }
                    }
                }
            }
            if(game.game_type=="singleplayer"){
                if (req.body.player == game.creator.name){
                    Grid.markHit(req.body.x, req.body.y,game.opponent_grid.board);
                    GameClass.Game.update({opponent_grid: game.opponent_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.opponent.name},{where: {game_id: req.params.id}})
                    if(Grid.checkShip(req.body.x, req.body.y,game.opponent_grid.board)){
                        GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: true}))},
                            {where: {game_id: req.params.id}});
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
                            console.log("Mossa dell'AI")
                            User.decrement(['tokens'], {by: 0.015, where: {email: game.opponent.name}});
                            const x_value = Math.floor(Math.random() * game.grid_size);
                            const y_value = Math.floor(Math.random() * game.grid_size);
                            Grid.markHit(x_value, y_value,game.creator_grid.board);
                            console.log(game.creator_grid.board)
                            GameClass.Game.update({creator_grid: game.creator_grid},{where: {game_id: req.params.id}})
                            GameClass.Game.update({turn: game.creator.name},{where: {game_id: req.params.id}})
                            if(Grid.checkShip(x_value,y_value,game.creator_grid.board)){
                                GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:x_value,y:y_value,player:game.opponent.name,hashitted: true}))},
                                    {where: {game_id: req.params.id}});
                                if (Grid.isGameFinished(game.creator_grid.board)){
                                    GameClass.Game.update({state: 'Finished', winner: game.opponent.name},{where: {game_id: req.params.id}})
                                    UserClass.User.update({on_game: false},{where: {email: game.creator.name}})
                                    UserClass.User.update({on_game: false},{where: {email: game.opponent.name}})
                                }
                            }
                            else{
                                GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:x_value,y:y_value,player:game.opponent.name,hashitted: false}))},
                                    {where: {game_id: req.params.id}});
                            }
                        }
                    }
                    else{
                        GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: false}))},
                            {where: {game_id: req.params.id}});
                        const response  = getSuccessMsg(SuccessMsgEnum.CorrectCharge).getMsg();
                        res.header("Content-Type", "application/json");
                        res.status(response.status).json({Message: "You didnt hit the enemy ship", Value:req.body.value})
                        console.log("Mossa dell'AI")
                        User.decrement(['tokens'], {by: 0.015, where: {email: game.opponent.name}});
                        const x_value = Math.floor(Math.random() * game.grid_size);
                        const y_value = Math.floor(Math.random() * game.grid_size);
                        Grid.markHit(x_value, y_value,game.creator_grid.board);
                        console.log(game.creator_grid.board)
                        GameClass.Game.update({creator_grid: game.creator_grid},{where: {game_id: req.params.id}})
                        GameClass.Game.update({turn: game.creator.name},{where: {game_id: req.params.id}})
                        if(Grid.checkShip(x_value,y_value,game.creator_grid.board)){
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:x_value,y:y_value,player:game.opponent.name,hashitted: true}))},
                                {where: {game_id: req.params.id}});
                            if (Grid.isGameFinished(game.creator_grid.board)){
                                GameClass.Game.update({state: 'Finished', winner: game.opponent.name},{where: {game_id: req.params.id}})
                                UserClass.User.update({on_game: false},{where: {email: game.creator.name}})
                                UserClass.User.update({on_game: false},{where: {email: game.opponent.name}})    
                            }
                        }
                        else{
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:x_value,y:y_value,player:game.opponent.name,hashitted: false}))},
                                {where: {game_id: req.params.id}});
                        }
                    }
                }
            }                  
        });
    }   
    catch(error) {
        controllerErrors(error,res); 
    }
}


