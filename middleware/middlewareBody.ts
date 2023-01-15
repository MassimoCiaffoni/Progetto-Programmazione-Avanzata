import {getErrorMsg,ErrorMsgEnum } from "../factory/ErrMsg";
import { SinglePlayerEnum, MultiPlayerEnum } from "../utils/Modes";


/**
 * Middleware layer 'BodyNewGame'
 * 
 * Check if the JSON body of create new game route is correct. 
 * The function check value types and relations between values.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function BodyNewGame(req:any,res:any,next:any) {
    if(typeof req.body.game_type =="string" && (req.body.game_type in SinglePlayerEnum || req.body.game_type in MultiPlayerEnum) && typeof req.body.silent_mode=="boolean" && 
            typeof req.body.opponent=="string" && (Number.isInteger(req.body.grid_size)) && req.body.grid_size>0 && (Number.isInteger(req.body.silences))  
            && req.body.silences>=0 && req.body.silences <=5 && req.body.ships.length > 0){                
                if(req.body.game_type in SinglePlayerEnum && req.body.silences>0){
                    next(ErrorMsgEnum.SilentIsNotZero)
                }
                else if(req.body.game_type in MultiPlayerEnum && req.body.silent_mode==false && req.body.silences>0){
                    next(ErrorMsgEnum.SilentIsNotZero)
                }
                else{
                    next()
                }  
    }
    else{
        next(ErrorMsgEnum.BadBodyFormat)
    }
}


/**
 * Middleware layer 'BodyAttack'
 * 
 * Check if the JSON body of attack route is correct. 
 * The function check value types.
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export async function BodyAttack(req:any,res:any,next:any){
    if((Number.isInteger(req.body.x)) && (Number.isInteger(req.body.y)) && typeof req.body.silence == "boolean"){
        next()
    }
    else{
        next(ErrorMsgEnum.BadBodyFormat)
    }
}