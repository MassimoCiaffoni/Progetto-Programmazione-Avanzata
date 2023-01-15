// Server Setup
require('dotenv').config();
import express from "express";
import * as controller from "./controller/controller";
import * as validation from "./middleware/middlewareVal";
import * as errorHandler from "./middleware/ErrorHandler";
import * as CoR from "./middleware/CoR";
import {SuccessMsgEnum, getSuccessMsg} from "./factory/SuccMsg";

// Network constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json());

// Token Validation
app.use(CoR.jwt);

// Check token payload
app.use(CoR.jwtPayload)

//POST route to charge token to specified user (admin route)
app.post('/charge',CoR.checkAdmin, (req: any, res: any) => {
    controller.ChargeUser(req,res);
});


//POST route to create a new game
app.post('/creategame',CoR.checkGameCreation, (req: any, res: any) => {
    controller.CreateNewGame(req,res);
});

//POST route to try an attack 
app.post('/:id/attack',CoR.checkAttack, (req: any, res: any) => {
    console.log("Controlli Terminati")
    controller.UseMove(req,res);
});


//GET basic route to check service
app.get('/', (req: any,res: any) => {
    const res_msg = getSuccessMsg(SuccessMsgEnum.AppStarted).getMsg();   
    res.status(res_msg.status).json({Message:res_msg.msg})
});


//GET route to catch game status
app.get('/:id/state',CoR.checkGameExistence, (req: any,res: any) => {
    controller.GetGameStatus(req,res);
});


//GET route to get game moves 
app.get('/:id/history',CoR.checkGameExistence, (req: any,res: any) => {
    controller.GetHistory(req,res);
});

// Server Startup
app.listen(PORT, HOST);
console.log(`Server started on port ${PORT}`);
