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

    public getIstance(): Sequelize {
        if (!DBConnection.instance) {
            DBConnection.instance = new DBConnection();
        }

        return DBConnection.instance.connection;
    }


}