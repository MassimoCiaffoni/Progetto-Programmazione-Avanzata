import * as UserClass from "../models/User";
import { Sequelize, DataTypes } from 'sequelize';
import { DBConnection } from '../singleton/DBConnection';
import { ErrorMsgEnum, getErrorMsg } from '../factory/ErrMsg';
import { Grid } from "../utils/Grid";

const sequelize: Sequelize = DBConnection.getInstance()

export const Game = sequelize.define('games',{
        game_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        creator: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        opponent: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        game_type: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        silence_mode: {
            type: DataTypes.STRING,
            defaultValue: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull:false,
            defaultValue: "Closed"
        },
        winner: {
            type: DataTypes.STRING,
            defaultValue: "Game not finished"
        },
        grid_size: {
            type: DataTypes.INTEGER,
            allowNull:false,
        }
    },
    {
    modelName: 'games',
    timestamps: false,
    freezeTableName: true,
    hooks:{
        afterCreate: async (record:any, options) => {
            await record.update({ 'state': 'Open' });
            }
        }
})

export async function CreateGameVal(options:any):Promise<any>{
    if (options.game_type=="singleplayer") {
        if (options.silent_mode == true){
            return ErrorMsgEnum.SilentError;
        }
        if (options.opponent!=="IA"){
            return ErrorMsgEnum.WrongOpponent
        }
        const playerone = await UserClass.CheckUser(options.creator).then((user) => { 
            if(user) return user;
            else return false;
        });
        if(!playerone) return ErrorMsgEnum.UserNotFound;
        return true;
    }
    else if (options.game_type=="multiplayer"){
    const playerone = await UserClass.CheckUser(options.creator).then((user) => { 
        if(user) return user;
        else return false;
    });
    if(!playerone) return ErrorMsgEnum.UserNotFound;
    const playertwo = await UserClass.CheckUser(options.opponent).then((user) => { 
        if(user) return user;
        else return false;
    });
    if(!playertwo) return ErrorMsgEnum.UserNotFound;
    //const ships = await CheckShipsNumber()
    return true
    }
    else {
        return ErrorMsgEnum.WrongMode;
    }
}


