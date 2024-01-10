const express = require("express");
const router = express.Router();
const dbConnection = require("../config");

/**
 * @swagger
 * /saved:
 *   get:
 *     summary: Retrieve all saved recipes for a user
 *     tags:
 *       - Saved Recipes
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User log ID
 *     responses:
 *       200:
 *         description: A list of saved recipes
 *       400:
 *         description: Error in the SQL statement
 */
router.get('/', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = 'SELECT * FROM savedRecipes WHERE userLogID = @userLogID ORDER BY CAST (recipeID as BIGINT) DESC;';
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
 * /saved:
 *   post:
 *     summary: Save a new recipe for a user
 *     tags:
 *       - Saved Recipes
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User log ID
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
 *                 type: object
 *     responses:
 *       200:
 *         description: Recipe was added
 *       400:
 *         description: Error adding the recipe
 */
router.post('/', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const recipeID = request.body.id;
    const recipe = request.body.recipe;
    const sqlQuery = 'INSERT INTO savedRecipes (userLogID, recipeID, recipe) VALUES (@userLogID, @recipeID, @recipe)';
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.input('recipeID', recipeID);
    sqlRequest.input('recipe', recipe);
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            return response.status(400).json({ Error: "Recipe was not added." });
        } else {
            return response.status(200).json({ Success: "Recipe was added!" });
        }
    }); 
});

/**
 * @swagger
 * /saved/collections:
 *   get:
 *     summary: Retrieve collections of saved recipes for a user
 *     tags:
 *       - Saved Recipes
 *     parameters:
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User log ID
 *     responses:
 *       200:
 *         description: A list of collections
 *       400:
 *         description: Error in the SQL statement
 */
router.get('/collections', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = `SELECT DISTINCT CAST([collection] AS VARCHAR(50)) FROM savedRecipes WHERE userLogID = @userLogID;`;
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        console.log(err);
        return response.status(400).json({Error: "Error in the SQL statement. Please check."});
    }
    return response.status(200).json(result.recordset);
    }); 
});

/**
 * @swagger
 * /saved/collections/{collection}:
 *   get:
 *     summary: Retrieve saved recipes by collection for a user
 *     tags:
 *       - Saved Recipes
 *     parameters:
 *       - in: path
 *         name: collection
 *         schema:
 *           type: string
 *         required: true
 *         description: Collection name
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User log ID
 *     responses:
 *       200:
 *         description: A list of saved recipes in the specified collection
 *       400:
 *         description: Error in the SQL statement
 */
router.get('/collections/:collection', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const collection = request.params.collection;
    const sqlQuery = `SELECT * FROM savedRecipes WHERE userLogID = @userLogID AND [collection] LIKE @collection ORDER BY CAST (recipeID as BIGINT) DESC;`;
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.input('collection', collection);
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            return response.status(400).json({Error: "Error in the SQL statement. Please check."});
        }      
        return response.status(200).json(parseRecipeJSON(result));
    }); 
}); 

/**
 * @swagger
 * /saved/collections/collection/{recipeID}:
 *   put:
 *     summary: Update the collection of a saved recipe
 *     tags:
 *       - Saved Recipes
 *     parameters:
 *       - in: path
 *         name: recipeID
 *         schema:
 *           type: string
 *         required: true
 *         description: Recipe ID
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collection:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record was updated
 *       400:
 *         description: Error updating the record
 */
router.put('/collections/collection/:recipeID', async (request, response) => {
    const userLogID = request.headers['user-log-id'];
    const recipeID = request.params.recipeID;
    const collection = request.body.collection;
    const sqlQuery = `UPDATE savedRecipes SET [collection] = @collection WHERE recipeID = @recipeID AND userLogID = @userLogID`;
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.input('collection', collection);
    sqlRequest.input('recipeID', recipeID);
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            console.log(err);
            return response.status(400).json({ Error: "Record was not updated." });
        } else {
            console.log("OK");
            return response.status(200).json({ Success: "Record was updated!" });
        }
    }); 
}); 

/**
 * @swagger
 * /saved/recipe/{recipeID}:
 *   delete:
 *     summary: Delete a saved recipe
 *     tags:
 *       - Saved Recipes
 *     parameters:
 *       - in: path
 *         name: recipeID
 *         schema:
 *           type: string
 *         required: true
 *         description: Recipe ID
 *       - in: header
 *         name: user-log-id
 *         schema:
 *           type: string
 *         required: true
 *         description: User log ID
 *     responses:
 *       200:
 *         description: Recipe was deleted
 *       400:
 *         description: Error deleting the recipe
 */
router.delete('/recipe/:recipeID', async (request, response) => {
    const recipeID = request.params.recipeID;
    const userLogID = request.headers['user-log-id'];
    const sqlQuery = 'DELETE FROM savedRecipes WHERE recipeID = @recipeID AND userLogID = @userLogID';
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.input('recipeID', recipeID);
    sqlRequest.query(sqlQuery, (err, result) => {
        if (err) {
            return response.status(400).json({ Error: "Recipe was not deleded." });
        } else {
            return response.status(200).json({ Success: "Recipe was deleted!" });
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