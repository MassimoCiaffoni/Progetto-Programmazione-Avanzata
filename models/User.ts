// Import libraries
import {DBConnection} from "../singleton/DBConnection";
import {DataTypes, Sequelize} from 'sequelize';

// Connection to database
const sequelize: Sequelize = DBConnection.getInstance();

export const User = sequelize.define('users', {
    user_id: {
        type: DataTypes.STRING(16),
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(40),
    },
    tokens: {
        type: DataTypes.DOUBLE,
    }
})



