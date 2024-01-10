const express = require("express");
const router = express.Router();
const dbConnection = require("../config");

/**
 * @swagger
 * components:
 *   responses:
 *     '200': 
 *       description: Successful response user's favorite recipes
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userLogID:
 *                 type: string
 *                 description: The user's ID (log in)
 *               recipeID:
 *                 type: string
 *                 description: The unique recipe ID
 *               recipe:
 *                 type: object
 *                 description: The recipe details including the name, ingredients, and instructions
 *     '400':
 *       description: Error fetching favorite recipes.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Error:
 *                 type: string
 *                 description: Error message indicating error in the sql database
 *             example:
 *               Error: "Error in the SQL statement. Please check."
 *     '400Pref':
 *       description: Recipes could not be found for user.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message for recipes (of user's prefernences) not being found
 *             example:
 *               message: "Recipes of other Budget Bytes users with your dietary preferences were not found."
 */

/**
 * @swagger
 * /favorite:
 *   get:
 *     tags:
 *       - Favorite Recipes
 *     summary: Retrieve all favorite recipes for a specific user
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1332
 *         description: ID of the user
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400':
 *         $ref: '#/components/responses/400'
 */
router.get('/', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = "SELECT * FROM favorites WHERE userLogID = @userLogID ORDER BY CAST (recipeID as BIGINT) DESC;";
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        console.log(err);
        return response.status(400).json({Error: "Error in the SQL statement. Please check."});
    }
    // response.setHeader('X-Faves-Of', userLogID);
    return response.status(200).json(parseRecipeJSON(result));
    }); 
});

/**
 * @swagger
 * /favorite/all:
 *   get:
 *     tags:
 *       - Favorite Recipes
 *     summary: Retrieve all favorite recipes across all users
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1332
 *         description: ID of the user
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400':
 *         $ref: '#/components/responses/400'
 */
router.get('/all', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = "SELECT * FROM favorites ORDER BY CAST (recipeID as BIGINT) DESC;";
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        return response.status(400).json({Error: "Error in the SQL statement. Please check."});
    }
    response.setHeader('X-Faves-All', 'every users faves');
    return response.status(200).json(parseRecipeJSON(result));
    }); 
});

/**
 * @swagger
 * /favorite/notUser:
 *   get:
 *     tags:
 *       - Favorite Recipes
 *     summary: Retrieve user IDs of all users except the requesting user from favorites
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1332
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of user IDs from favorites
 */
router.get('/notUser', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = "SELECT DISTINCT userLogID FROM favorites WHERE userLogID <> @userLogID;";
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        return response.status(400).json({Error: "Error in the SQL statement. Please check."});
    }
    response.setHeader('X-Exclude-Faves-ID', userLogID);
    return response.status(200).json(result);
    }); 
});

/**
 * @swagger
 * /favorite:
 *   post:
 *     summary: Add a new favorite recipe for a user
 *     tags:
 *       - Favorite Recipes
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1332
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Recipe ID
 *               recipe:
 *                 type: object
 *                 description: Recipe object including recipe details
 *     responses:
 *       200:
 *         description: Favorite recipe added successfully
 *       400:
 *         description: Error adding the favorite recipe
 */
router.post('/', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const recipeID = request.body.id;
    const recipe = request.body.recipe;
    const sqlQuery = 'INSERT INTO favorites (userLogID, recipeID, recipe) VALUES (@userLogID, @recipeID, @recipe)';
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.input('recipeID', recipeID);
    sqlRequest.input('recipe', recipe);
    response.setHeader('X-Add-Fave', recipeID);
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
 * /favorite/{id}:
 *   delete:
 *     summary: Delete a favorite recipe
 *     tags:
 *       - Favorite Recipes
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Recipe ID
 *       - $ref: '#/components/parameters/userID'
 *     responses:
 *       200:
 *         description: Favorite recipe deleted successfully
 *       400:
 *         description: Error deleting the favorite recipe
 */
router.delete('/:id', async (request, response) => {
    const recipeID = request.params.id;
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = `DELETE FROM favorites WHERE recipeID = @recipeID AND userLogID = @userLogID`;
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.input('recipeID', recipeID);
    response.setHeader('X-Delete-Fave', recipeID);
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            return response.status(400).json({ Error: "Record was not deleded." });
        } else {
            return response.status(200).json({ Success: "Record was deleted!" });
        }
    }); 
});

function parseRecipeJSON(data) {
    return data.recordsets.map(recordset =>
        recordset.map(item => ({
        ...item,
        recipe: JSON.parse(item.recipe)
        }))
    );
}

module.exports = router;