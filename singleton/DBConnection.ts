// Import libraries
import {Sequelize} from 'sequelize';

/**
 * Class 'DBConnection'
 * 
 * Class that ensures that the database connection through the library {@link Sequelize} is unique,
 * thus ensuring a single connection to the PostgreSQL database.
 */
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

    public static getInstance(): Sequelize {
        if (!DBConnection.instance) {
            DBConnection.instance = new DBConnection();
        }

        return DBConnection.instance.connection;
    }


}