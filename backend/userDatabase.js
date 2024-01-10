const sql = require('mssql');
const dbConnection = require('./config');
async function createUser(user) {
  const { userLogID, isVegan, isVegetarian, isDairyFree, isLowCarb, isPescetarian } = user;
    const request = dbConnection.request();
    return request
      .input('userLogID', sql.VarChar, userLogID)
      .input('isVegan', sql.VarChar, isVegan)
      .input('isVegetarian', sql.VarChar, isVegetarian)
      .input('isDairyFree', sql.VarChar, isDairyFree)
      .input('isLowCarb', sql.VarChar, isLowCarb)
      .input('isPescetarian', sql.VarChar, isPescetarian)
      .query('INSERT INTO BudgetBytesTable (userLogID, isVegan, isVegetarian, isDairyFree, isLowCarb, isPescetarian) VALUES (@userLogID, @isVegan, @isVegetarian, @isDairyFree, @isLowCarb, @isPescetarian)');
}

  async function readAll() {
    const request = dbConnection.request();
    return request.query('SELECT * FROM BudgetBytesTable');
  }

  async function readUser(userLogID) {
    const request = dbConnection.request();
    return request
      .input('userLogID', sql.VarChar, userLogID)
      .query('SELECT * FROM BudgetBytesTable WHERE userLogID = @userLogID');
  }

  async function updateUser(userLogID, updatedUser) {
    const { isVegan, isVegetarian, isDairyFree, isLowCarb, isPescetarian } = updatedUser;
    const request = dbConnection.request();
    return request
      .input('userLogID', sql.VarChar, userLogID)
      .input('isVegan', sql.VarChar, isVegan)
      .input('isVegetarian', sql.VarChar, isVegetarian)
      .input('isDairyFree', sql.VarChar, isDairyFree)
      .input('isLowCarb', sql.VarChar, isLowCarb)
      .input('isPescetarian', sql.VarChar, isPescetarian)
      .query('UPDATE BudgetBytesTable SET isVegan = @isVegan, isVegetarian = @isVegetarian, isDairyFree = @isDairyFree, isLowCarb = @isLowCarb, isPescetarian = @isPescetarian WHERE userLogID = @userLogID');
  }

  async function deleteUser(userLogID) {
    const request = dbConnection.request();
    const query = `
      DELETE FROM BudgetBytesTable WHERE userLogID = @userLogID;
      DELETE FROM favorites WHERE userLogID = @userLogID;
      DELETE FROM savedRecipes WHERE userLogID = @userLogID;
      DELETE FROM recipeHistory WHERE userLogID = @userLogID;
    `;
    return request
      .input('userLogID', sql.VarChar, userLogID)
      .query(query);
  }

module.exports = {
    createUser,
    readAll,
    readUser,
    updateUser,
    deleteUser
};