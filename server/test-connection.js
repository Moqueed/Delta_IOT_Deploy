const sequelize = require("./config/database")

const testConnection = async() => {
    try{
        await sequelize.authenticate();
        console.log('✅ Connection to MySQL successful!');
    } catch(error){
        console.error('❌ Unable to connect to MySQL:', error);
    }
};

testConnection();