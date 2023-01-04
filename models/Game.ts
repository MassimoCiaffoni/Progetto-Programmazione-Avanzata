// Import libraries
import {DBConnection} from "../singleton/DBConnection";
import {DataTypes, Sequelize} from 'sequelize';


//Connection to database
const sequelize: Sequelize = DBConnection.getInstance();
export const Game = sequelize.define('games', {

});