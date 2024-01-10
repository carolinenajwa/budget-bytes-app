const express = require("express");
const router = express.Router();
const dbConnection = require("../config");

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Retrieve all recipe history for a specific user
 *     tags:
 *       - Recipe History
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User Log ID
 *     responses:
 *       200:
 *         description: A list of recipe history for the user
 *       400:
 *         description: Error in SQL statement
 */
router.get('/', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = "SELECT * FROM recipeHistory WHERE userLogID = @userLogID;";
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            return response.status(400).json({Error: "Error in the SQL statement. Please check."});
        }
        return response.status(200).json(parseRecipeJSON(result));
    }); 
});

/**
 * @swagger
 * /history:
 *   post:
 *     summary: Save a new recipe history record for a user
 *     tags:
 *       - Recipe History
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User Log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               recipe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record added successfully
 *       400:
 *         description: Error adding the record
 */
router.post('/', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const recipeID = request.body.id;
    const recipe = request.body.recipe;
    const sqlQuery = 'INSERT INTO recipeHistory (userLogID, recipeID, recipe) VALUES (@userLogID, @recipeID, @recipe)';
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.input('recipeID', recipeID);
    sqlRequest.input('recipe', recipe);
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            return response.status(400).json({ Error: "Record was not added." });
        } else {
            return response.status(200).json({ Success: "Record was added!" });
        }
    }); 
});

/**
 * @swagger
 * /history/notUser:
 *   get:
 *     summary: Retrieve recipe history for all users except the requesting user
 *     tags:
 *       - Recipe History
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User Log ID
 *     responses:
 *       200:
 *         description: A list of user IDs who have recipe histories
 *       400:
 *         description: Error in SQL statement
 */
router.get('/notUser', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = "SELECT DISTINCT userLogID FROM recipeHistory WHERE userLogID <> @userLogID;";
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        return response.status(400).json({Error: "Error in the SQL statement. Please check."});
    }
    return response.status(200).json(result);
    }); 
});

/**
 * @swagger
 * /history/all:
 *   get:
 *     summary: Retrieve all recipe history across all users
 *     tags:
 *       - Recipe History
 *     responses:
 *       200:
 *         description: A list of all recipe history
 *       400:
 *         description: Error in SQL statement
 */
router.get('/all', async (request, response) => {
    const sqlQuery = "SELECT * FROM recipeHistory";
    const sqlRequest = dbConnection.request();
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            return response.status(400).json({Error: "Error in the SQL statement. Please check."});
        }
        return response.status(200).json(parseRecipeJSON(result));
    });
});

//updated it to prevent the JSON.parse from failing when the recipe field is not a valid JSON string
function parseRecipeJSON(data) {
    try {
        return data.recordsets.map(recordset =>
            recordset
                .filter(item => isValidJSON(item.recipe))
                .map(item => ({
                    ...item,
                    recipe: JSON.parse(item.recipe)
                }))
        );
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return [];
    }
}

// Helper function to check if a string is a valid JSON
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = router;