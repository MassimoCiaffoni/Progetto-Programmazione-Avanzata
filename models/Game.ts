import { User } from './User';
import { GameState } from './GameState';
import { Sequelize, DataTypes } from 'sequelize';
import { DBConnection } from '../singleton/DBConnection';

const sequelize: Sequelize = DBConnection.getInstance()

export const Game = sequelize.define('games',{
    game_id: {
        type: DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement: true,
    },
    playerone: {
        type: DataTypes.STRING(16),
    },
    playertwo: {
        type: DataTypes.STRING(16),
    },
    state: {
        type: DataTypes.STRING(30),
    },
    winner: {
        type: DataTypes.STRING(16),
    },
    modelName: 'games',
})