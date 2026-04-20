import pool from './connection'

const connectDB = async () => {
    try{
        const client = await pool.connect();
        console.log("database connected successfully");
        client.release();
    }catch(err){
        console.log("db connection failed", err);

        process.exit(1); //this prevents the server from starting if the db is unavailable
    }
}



export default connectDB;