import {getErrorMsg,ErrorMsgEnum } from "../factory/ErrMsg";



export async function BodyNewGame(req:any,res:any,next:any) {
    if(typeof req.body.game_type =="string" && (req.body.game_type =="singleplayer" || req.body.game_type =="multiplayer") && typeof req.body.silent_mode=="boolean" && 
            typeof req.body.opponent=="string" && (Number.isInteger(req.body.grid_size)) && req.body.grid_size>0 && (Number.isInteger(req.body.silences))  
            && req.body.silences>=0 && req.body.silences <=5 && req.body.ships.length > 0){                
                if(req.body.game_type =="singleplayer" && req.body.silences>0){
                    next(ErrorMsgEnum.SilentIsNotZero)
                }
                else if(req.body.game_type =="multiplayer" && req.body.silent_mode==false && req.body.silences>0){
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


export async function BodyAttack(req:any,res:any,next:any){
    if((Number.isInteger(req.body.x)) && (Number.isInteger(req.body.y)) && typeof req.body.silence == "boolean"){
        next()
    }
    else{
        next(ErrorMsgEnum.BadBodyFormat)
    }
}