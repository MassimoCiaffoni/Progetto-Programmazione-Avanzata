// Import libraries
require('dotenv').config();
import * as jwt from 'jsonwebtoken';
import {ErrorMsgEnum} from "../factory/ErrMsg";


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

