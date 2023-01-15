//import libraries
import * as UserClass from "../models/User";
import { Sequelize, DataTypes } from 'sequelize';
import { DBConnection } from '../singleton/DBConnection';
import { ErrorMsgEnum, getErrorMsg } from '../factory/ErrMsg';
import { SinglePlayerEnum, MultiPlayerEnum } from "../utils/Modes";

// Conection to database
const sequelize: Sequelize = DBConnection.getInstance()

/**
 * Model 'Game'
 * 
 * Define the model 'Game' to interface with the "games" table in the PostgreSQL database
 */
export const Game = sequelize.define('games',{
        game_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        creator: {
            type: DataTypes.JSON,
            allowNull:false,
            defaultValue: {}
        },
        opponent: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        game_type: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        silent_mode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        creator_silent: {
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        opponent_silent: {
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull:false,
            defaultValue: "Closed"
        },
        turn: {
            type: DataTypes.STRING,
            allowNull:false,
            defaultValue: "Not setted"
        },
        winner: {
            type: DataTypes.STRING,
            defaultValue: "Game not finished"
        },
        grid_size: {
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        creator_grid: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        opponent_grid: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        moves: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            allowNull: true,
        }
    },
    {
    modelName: 'games',
    timestamps: false,
    freezeTableName: true,
    hooks:{
        afterCreate: async (record:any, options: any) => {
            await record.update({ 'state': 'Open' });
            await record.update({'turn': record.creator.name});
        }
    }
})


/**
 * The function check if users of the game to create exists and mode values control.
 * @param options Request body.
 * @returns Error message or control passed.
 */
export async function CreateGameVal(options:any):Promise<any>{
    if (options.game_type in SinglePlayerEnum) {
        if (options.silent_mode == true){
            return ErrorMsgEnum.SilentError;
        }
        if (options.opponent!=="AI"){
            return ErrorMsgEnum.WrongOpponent
        }
        const playerone = await UserClass.CheckUser(options.creator).then((user) => { 
            if(user) return user;
            else return false;
        });
        if(!playerone) return ErrorMsgEnum.UserNotFound;
        return true;
    }
    else if (options.game_type in MultiPlayerEnum){
        if (options.opponent=="AI"){
            return ErrorMsgEnum.WrongOpponent
        }
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
        return true
        }
    else {
        return ErrorMsgEnum.WrongMode;
    }
}


