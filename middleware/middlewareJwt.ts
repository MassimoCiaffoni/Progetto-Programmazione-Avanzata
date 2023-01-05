// Import libraries
require('dotenv').config();
import * as jwt from 'jsonwebtoken';
import {ErrorMsgEnum} from "../factory/ErrMsg";

export const requestTime = (req: any,res: any,next: any) =>{
    req.requestTime = Date.now();
    next();
};

export const checkHeader = (req: any, res: any, next: any) => {    
    const authHeader = req.headers.authorization;
    if(authHeader){
        next();
    } else {
        next(ErrorMsgEnum.NoHeader);
    }   
};

export const checkToken = (req: any, res: any, next: any) => {
    try{
    const bearerHeader = req.headers.authorization;
    if(typeof bearerHeader!== 'undefined'){
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    }
    }catch(error){
        next(ErrorMsgEnum.MissingToken);
    }    
};

export const verifyAndAuthenticate = (req: any, res: any, next: any) => {
    try{
        let decoded = jwt.verify(req.token, process.env.SECRET_KEY!);
        console.log(decoded)
        if(decoded !== null){
            req.user = decoded;
            next();
        }
    }catch(error){
        next(ErrorMsgEnum.InvalidToken);
    }
};

/**
 * Middleware layer 'checkJwtPayload'
 * 
 * Check sintax of token fields and user role (Admin/User) 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkJwtPayload = (req: any, res: any, next: any) => {
    console.log(req.user);
    if(req.user.role === 'admin' || req.user.role === 'user') {
        next();
    }else{
        next(ErrorMsgEnum.BadPayloadFormat);
    }
};

