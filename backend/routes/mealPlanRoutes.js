const express = require("express");
const router = express.Router();
const dbConnection = require("../config");
let notFound = false;

/**
 * @swagger
 * components:
 *   parameters:
 *     userID:
 *       in: path
 *       name: userID
 *       required: true
 *       schema:
 *         type: string
 *         example: 1332
 *       description: ID of the user
 *   responses:
 *     '200': 
 *       description: Successful response with 7 (or less, depending on available recipes) random recipes
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
 *           example:
 *             - - userLogID: "1332"
 *                 recipeID: "1702343598952"
 *                 recipe:
 *                   name: "Sure! Here's a delicious and easy recipe for Teriyaki Chicken and Rice Bowls:"
 *                   ingredients:
 *                     - "<li>2 boneless, skinless chicken breasts</li>"
 *                     - "<li>2 tablespoons of teriyaki sauce</li>"
 *                     - "<li>2 tablespoons of honey</li>"
 *                     - "<li>1 cup of cooked white rice</li>"
 *                     - "<li>1/2 cup of frozen vegetables</li>"
 *                     - "<li>1 tablespoon of olive oil</li>"
 *                   instructions:
 *                     - "<li>Preheat oven to 375 degrees F.</li>"
 *                     - "<li>Place chicken breasts in a baking dish.</li>"
 *                     - "<li>In a small bowl, mix together the teriyaki sauce and honey.</li>"
 *                     - "<li>Pour the sauce mixture over the chicken breasts and spread it evenly.</li>"
 *                     - "<li>Bake the chicken in the preheated oven for 25 minutes.</li>"
 *                     - "<li>Meanwhile, prepare the rice according to package instructions.</li>"
 *                     - "<li>Heat olive oil in a skillet over medium heat.</li>"
 *                     - "<li>Add frozen vegetables and cook until tender.</li>"
 *                     - "<li>Serve chicken over cooked rice and top with cooked vegetables. Enjoy!</li>"
 *     '400':
 *       description: Error fetching recipes.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Error:
 *                 type: string
 *                 description: Error message specifying the missing image file
 *             example:
 *               Error: "Error fetching recipes"
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
 * /mealPlan/favorite/{userID}:
 *   get:
 *     tags:
 *       - Meal Plan
 *     summary: Get 7 random recipes from user favorites
 *     description: Retrieve 7 random recipes from the user's favorites.
 *     parameters:
 *       - $ref: '#/components/parameters/userID'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400': 
 *         $ref: '#/components/responses/400'
 */
router.get('/favorite/:userID', async (request, response) => {
    const userLogID = request.params.userID;
    const sqlQuery = 'SELECT TOP 7 * FROM favorites WHERE userLogID = @userLogID ORDER BY NEWID()'
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        return response.status(400).json({Error: "Error fetching recipes"});
    }
    response.setHeader('X-Random-Fave-From', userLogID);
    return response.status(200).json(parseRecipeJSON(result));
    }); 
});

/**
 * @swagger
 * /mealPlan/saved/{userID}:
 *   get:
 *     tags:
 *       - Meal Plan
 *     summary: Get 7 random recipes from users saved
 *     description: Retrieve 7 random recipes from the user's saved recipes.
 *     parameters:
 *       - $ref: '#/components/parameters/userID'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400': 
 *         $ref: '#/components/responses/400'
 */
router.get('/saved/:userID', async (request, response) => {
    const userLogID = request.params.userID;
    const sqlQuery = 'SELECT TOP 7 * FROM savedRecipes WHERE userLogID = @userLogID ORDER BY NEWID()'
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        return response.status(400).json({Error: "Error fetching recipes"});
    }
    response.setHeader('X-Random-Saved-From', userLogID);
    return response.status(200).json(parseRecipeJSON(result));
    }); 
});

/**
 * @swagger
 * /mealPlan/history/{userID}:
 *   get:
 *     tags:
 *       - Meal Plan
 *     summary: Get 7 random recipes from users history
 *     description: Retrieve 7 random recipes from the user's recipe history.
 *     parameters:
 *       - $ref: '#/components/parameters/userID'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400': 
 *         $ref: '#/components/responses/400'
 */
router.get('/history/:userID', async (request, response) => {
    const userLogID = request.params.userID;
    const sqlQuery = 'SELECT TOP 7 * FROM recipeHistory WHERE userLogID = @userLogID ORDER BY NEWID()'
    const sqlRequest = dbConnection.request();
    sqlRequest.input('userLogID', userLogID);
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        return response.status(400).json({Error: "Error fetching recipes"});
    }
    response.setHeader('X-Random-History-From', userLogID);
    return response.status(200).json(parseRecipeJSON(result));
    }); 
});

/**
 * @swagger
 * /mealPlan/all:
 *   get:
 *     tags:
 *       - Meal Plan
 *     summary: Get 7 random recipes from all users' recipe history
 *     description: Retrieve 7 random recipes from all Budget Bytes users' recipe history.
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400': 
 *         $ref: '#/components/responses/400'
 */
router.get('/all', async (request, response) => {
    const sqlQuery = 'SELECT TOP 7 * FROM recipeHistory ORDER BY NEWID()'
    const sqlRequest = dbConnection.request();
    sqlRequest.query(sqlQuery, (err, result) => {
    if (err) {
        return response.status(400).json({Error: "Error fetching"});
    }
    response.setHeader('X-Random-All', 'from entire recipe history');
    return response.status(200).json(parseRecipeJSON(result));
    }); 
});

/**
 * @swagger
 * /mealPlan/preference/all/{userID}:
 *   get:
 *     tags:
 *       - Meal Plan
 *     summary: Get 7 random recipes from other users' history
 *     description: Retrieve 7 random recipes from other users' recipe history based on user preferences.
 *     parameters:
 *       - $ref: '#/components/parameters/userID'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400': 
 *         $ref: '#/components/responses/400Pref'
 */
router.get('/preference/all/:userID', async (request, response) => {
    notFound = false;
    const userLogID = request.params.userID;
    const history = await fetchAllRecipes(userLogID);
    if (!notFound) {
        const shuffled = history.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, 7);
        let recipesArr = [[...selected]];
        return response.status(200).json(recipesArr);
    }
    response.setHeader('X-Random-All-Pref', 'from entire recipe history');
    return response.status(400).json({message: "Recipes of other Budget Bytes users with your dietary preferences were not found."});
});

/**
 * @swagger
 * /mealPlan/preference/favorites/{userID}:
 *   get:
 *     tags:
 *       - Meal Plan
 *     summary: Get 7 random recipes from other users' favorites
 *     description: Retrieve 7 random recipes from other Budget Bytes users' favorite recipes based on user preferences.
 *     parameters:
 *       - $ref: '#/components/parameters/userID'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/200'
 *       '400': 
 *         $ref: '#/components/responses/400Pref'
 */
router.get('/preference/favorites/:userID', async (request, response) => {
    notFound = false;
    const userLogID = request.params.userID;
    const favorites = await fetchFavorites(userLogID);
    if (!notFound) {
        const shuffled = favorites.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, 7);
        let recipesArr = [[...selected]];
        return response.status(200).json(recipesArr);
    }
    response.setHeader('X-Random-Fave-Pref', 'from all user favorites');
    return response.status(400).json({message: "Favorite Recipes of other Budget Bytes users with your dietary preferences were not found."});
});

/**
 * Fetches all recipes (recipe history of all users) based on a user ID by making an HTTP GET request to the explore api.
 * @param {string} userID - The ID of the user
 * @returns {Promise<object[]>|undefined} - A Promise resolving to an array of recipes or undefined if not found
 */
async function fetchAllRecipes(userID) {
    const response = await fetch(`http://localhost:3001/explore/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();  
    if (response.status === 400) {
        notFound = true;
        return;
    } 
    return data;
}

/**
 * Fetches favorite recipes (that aren't the current user's) based on a user ID by making an HTTP GET request to the explore api.
 * @param {string} userID - The ID of the user
 * @returns {Promise<object[]>|undefined} - A Promise resolving to an array of favorite recipes or undefined if not found
 */
async function fetchFavorites(userID) {
    const response = await fetch(`http://localhost:3001/explore/favorites/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();   
    if (response.status === 400) {
        notFound = true;
        return;
    }
    return data;
}

/**
 * Parses the JSON data of recipes received from the database.
 * @param {object[]} data - The array of recipe data fetched from the database
 * @returns {object[]} - An array of parsed recipes
 */
function parseRecipeJSON(data) {
    return data.recordsets.map(recordset =>
        recordset.map(item => ({
        ...item,
        recipe: JSON.parse(item.recipe)
        }))
    );
}

module.exports = router;