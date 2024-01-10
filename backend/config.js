const sql = require('mssql');

const config = {
    user: 'groupMember', 
    password: 'groupPassword4', 
    server: 'budget-bytes.database.windows.net', 
    port: 1433,
    database: 'budgetbytesdb',
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

const dbConnection = new sql.ConnectionPool(config);

dbConnection.connect().then(() => {
    console.log('Connected to Azure SQL Database.');
    })
    .catch(err => {
        console.error('Error connecting to Azure SQL Database:', err);
    });

module.exports = dbConnection;