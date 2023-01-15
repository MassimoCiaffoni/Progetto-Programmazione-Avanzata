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
import { SinglePlayerEnum, MultiPlayerEnum } from "../utils/Modes";


const sequelize: Sequelize = DBConnection.getInstance();

/**
 * Function 'controllerErrors'
 * 
 * Function to send controller errors.
 * If one of the controller functions try statement fail the server response with internal error.
 * 
 * @param error Error message.
 * @param res Server response
 */
export function controllerErrors(error:any,res: any) {
    console.log(error)
    const new_err_msg = getErrorMsg(ErrorMsgEnum.InternalServerError).getMsg();
    res.status(new_err_msg.status).json(new_err_msg);
}

/**
 * Function 'CreateNewGame'
 * 
 * Function to create a new game.
 * Generate Grid structure with board and placed ships and insert a new game on the database.
 * Decrement creator tokens and set player's on_game values true.
 * 
 * @param req Client request
 * @param res Server response
 */
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

/**
 * Function 'ChargeUser'
 * 
 * Function used by admin to charge on user with tokens.
 * 
 * @param req Client request
 * @param res Server response
 */
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

/**
 * Function 'GetGameStatus'
 * 
 * Function that display current game state.
 * 
 * @param req Client request
 * @param res Server response
 */
export async function GetGameStatus(req: any, res:any){
    const id = req.params.id;
    try {
        await GameClass.Game.findOne({
            attributes : ['state','game_type','winner','turn'],
            where: {game_id: id}
        }).then((game)=>{
            const response  = getSuccessMsg(SuccessMsgEnum.CorrectState).getMsg();
            res.header("Content-Type", "application/json");
            res.status(response.status).json({Message: response, Value:game})
        });
    }
    catch(error) {
        console.log(error)
        controllerErrors(error,res); 
    }
}

/**
 * Function 'GetGameStatus'
 * 
 * Function that display current game moves on CSV format.
 * 
 * @param req Client request
 * @param res Server response
 */
export async function GetHistory(req: any, res:any){
    const id = req.params.id;
    try {
    await GameClass.Game.findOne({
        attributes : ['moves'],
        where: {game_id: id}
    }).then((game)=>{
        const moves = game.moves;
        const fields = Object.keys(moves[0]);
        const csv = moves.map((row: any) => fields.map((fieldname:any) => JSON.stringify(row[fieldname])).join(','))
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

/**
 * Function 'UseMove'
 * 
 * Function that perform an attack.
 * Change attacked player board structure and check if the game is finished.
 * 
 * @param req Client request
 * @param res Server response
 */
export async function UseMove(req: any, res: any) {
    try{
        let silence = req.body.silence;
        User.decrement(['tokens'], {by: 0.015, where: {email: req.body.player}}); 
        await GameClass.Game.findOne({where: {game_id: req.params.id}}).then((game: any)=>{
            if(game.game_type in MultiPlayerEnum){
                // Chekck if silence move is used
                if (req.body.player == game.creator.name){
                    if (silence){
                        GameClass.Game.update({creator: {name: game.creator.name, silent_use: true}},{where: {game_id: req.params.id}})
                    }
                    Grid.markHit(req.body.x, req.body.y,game.opponent_grid.board);
                    GameClass.Game.update({opponent_grid: game.opponent_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.opponent.name},{where: {game_id: req.params.id}})
                    // Check if the attack hit an enemy ship
                    if(Grid.checkShip(req.body.x, req.body.y,game.opponent_grid.board)){   
                        // Check if the game is finished                    
                        if (Grid.isGameFinished(game.opponent_grid.board)){
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: true}))},
                                {where: {game_id: req.params.id}});
                            let final_moves=Grid.ChangeSilentMoves(game.moves);
                            GameClass.Game.update({moves: final_moves},{where: {game_id: req.params.id}})                             
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
                    // Chekck if silence move is used
                    if (silence){
                        GameClass.Game.update({opponent: {name: game.opponent.name, silent_use: true}},{where: {game_id: req.params.id}})
                    }
                    Grid.markHit(req.body.x, req.body.y,game.creator_grid.board);
                    GameClass.Game.update({creator_grid: game.creator_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.creator.name},{where: {game_id: req.params.id}})
                    // Check if the attack hit an enemy ship
                    if(Grid.checkShip(req.body.x, req.body.y,game.creator_grid.board)){
                        // Check if the game is finished  
                        if (Grid.isGameFinished(game.creator_grid.board)){     
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.opponent.name,hashitted: true}))},
                                {where: {game_id: req.params.id}});  
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
            // Player attack and AI move on singleplayer mode
            if(game.game_type in SinglePlayerEnum){
                if (req.body.player == game.creator.name){
                    Grid.markHit(req.body.x, req.body.y,game.opponent_grid.board);
                    GameClass.Game.update({opponent_grid: game.opponent_grid},{where: {game_id: req.params.id}})
                    GameClass.Game.update({turn: game.opponent.name},{where: {game_id: req.params.id}})
                    // Check if the attack hit an enemy ship
                    if(Grid.checkShip(req.body.x, req.body.y,game.opponent_grid.board)){
                        GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:req.body.x,y:req.body.y,player:game.creator.name,hashitted: true}))},
                            {where: {game_id: req.params.id}});
                        // Check if the game is finished      
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
                            console.log("AI move")
                            User.decrement(['tokens'], {by: 0.015, where: {email: game.opponent.name}});
                            const x_value = Math.floor(Math.random() * game.grid_size);
                            const y_value = Math.floor(Math.random() * game.grid_size);
                            Grid.markHit(x_value, y_value,game.creator_grid.board);
                            console.log(game.creator_grid.board)
                            GameClass.Game.update({creator_grid: game.creator_grid},{where: {game_id: req.params.id}})
                            GameClass.Game.update({turn: game.creator.name},{where: {game_id: req.params.id}})
                            // Check if the AI attack hit an player ship
                            if(Grid.checkShip(x_value,y_value,game.creator_grid.board)){
                                GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:x_value,y:y_value,player:game.opponent.name,hashitted: true}))},
                                    {where: {game_id: req.params.id}});
                                // Check if the game is finished  
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
                        console.log("AI move")
                        User.decrement(['tokens'], {by: 0.015, where: {email: game.opponent.name}});
                        const x_value = Math.floor(Math.random() * game.grid_size);
                        const y_value = Math.floor(Math.random() * game.grid_size);
                        Grid.markHit(x_value, y_value,game.creator_grid.board);
                        console.log(game.creator_grid.board)
                        GameClass.Game.update({creator_grid: game.creator_grid},{where: {game_id: req.params.id}})
                        GameClass.Game.update({turn: game.creator.name},{where: {game_id: req.params.id}})
                        // Check if the AI attack hit an player ship
                        if(Grid.checkShip(x_value,y_value,game.creator_grid.board)){
                            GameClass.Game.update({moves:Sequelize.fn('array_append', Sequelize.col('moves'),JSON.stringify({x:x_value,y:y_value,player:game.opponent.name,hashitted: true}))},
                                {where: {game_id: req.params.id}});
                            // Check if the game is finished  
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


