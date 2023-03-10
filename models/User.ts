// Import libraries
import {DBConnection} from "../singleton/DBConnection";
import {DataTypes, Sequelize} from 'sequelize';
import { ErrorMsgEnum, getErrorMsg } from '../factory/ErrMsg';

// Connection to database
const sequelize: Sequelize = DBConnection.getInstance()

/**
 * Model 'User'
 * 
 * Define the model 'User' to interface with the "users" table in the PostgreSQL database
 */
export const User = sequelize.define('users', {
    email: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull:false,
        },
    tokens: {
        type: DataTypes.DOUBLE,
        allowNull:false,
        },
    rule: {
        type: DataTypes.STRING,
        allowNull:false,
        },
    on_game: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
  
{
    modelName: 'users',
    timestamps: false,
    freezeTableName: true
})


/**
 * Verify User in database.
 * @param email Mail of the player.
 * @returns  Result.
 */
export async function CheckUser(email:string):Promise<any> {
    let result:any;
    try{
        result = await User.findByPk(email,{raw:true});
    }catch{
        console.log("Database Server Error")
    }
    return result;
};

/**
 * Check if the users exists and the request is done by the admin.
 * @param chargedata Body of the request.
 * @returns Boolean value.
 */
export async function TokenChargeVal(chargedata:any): Promise<any> {
    const admin= await CheckUser(chargedata.username_admin.email).then((user)=>{
        if(user) return user;
        else return false;
    })
    if(!admin) return ErrorMsgEnum.UserNotFound
    if(chargedata.username_admin.role !=="admin") return ErrorMsgEnum.UserNotAdmin
    const user = await CheckUser(chargedata.destination_user).then((user) => { 
        if(user) return user;
        else return false;
    });
    if(!user ) return ErrorMsgEnum.UserNotFound;
    return true;
}


