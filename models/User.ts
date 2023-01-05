// Import libraries
import {DBConnection} from "../singleton/DBConnection";
import {DataTypes, Sequelize} from 'sequelize';
import { ErrorMsgEnum, getErrorMsg } from '../factory/ErrMsg';

// Connection to database
const sequelize: Sequelize = DBConnection.getInstance()

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
    },
{
    modelName: 'users',
    timestamps: false,
    freezeTableName: true
})


/**
 * Verify User 
 * @param email mail of player
 * @returns  result
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


