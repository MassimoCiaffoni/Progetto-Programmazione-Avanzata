// Import libraries
import {Sequelize} from 'sequelize';


export class DBConnection {

    private static instance: DBConnection;

    private connection: Sequelize;

    private constructor() {
		this.connection = new Sequelize(process.env.PGDATABASE!, process.env.PGUSER!, process.env.PGPASSWORD, {
			host: process.env.PGHOST,
			port: Number(process.env.PGPORT),
			dialect: 'postgres'
		});
	}

<<<<<<< HEAD
    public getInstance(): Sequelize {
=======
    public getIstance(): Sequelize {
>>>>>>> c3f2c1a2f23a2cb2a68d992e8eec64315148dc5c
        if (!DBConnection.instance) {
            DBConnection.instance = new DBConnection();
        }

        return DBConnection.instance.connection;
    }


}