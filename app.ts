// Server Setup
require('dotenv').config();
import express from "express";
import * as controller from "./controller/controller";
import * as validation from "./middleware/middlewareVal";
import * as errorHandler from "./middleware/ErrorHandler";
import * as CoR from "./middleware/CoR";
import {SuccessMsgEnum, getSuccessMsg} from "./factory/SuccMsg";
import { Grid } from "./utils/Grid";

// Network constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json());

app.use(CoR.jwt);
app.use(CoR.jwtPayload)

//POST route to charge token to specified user
app.post('/charge',CoR.checkAdmin, (req: any, res: any) => {
    controller.ChargeUser(req,res);
});

app.post('/creategame',CoR.checkGame, (req: any, res: any) => {
    controller.CreateNewGame(req,res);
    let ConstructorGrid = new Grid(req.body.ships.length, req.body.grid_size)
    console.log("Grandezza della griglia")
    console.log(ConstructorGrid.GridSize)
});
app.get('/', (req: any,res: any) => {
    const res_msg = getSuccessMsg(SuccessMsgEnum.AppStarted).getMsg();   
    res.status(res_msg.status).json({Message:res_msg.msg})
});

app.get('/:id/state',CoR.checkGameExistence, (req: any,res: any) => {
    controller.CheckGameStatus(req,res);
});

app.listen(PORT, HOST);
console.log(`Server started on port ${PORT}`);
