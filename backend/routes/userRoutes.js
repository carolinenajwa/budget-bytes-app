const express = require("express");
const router = express.Router();
const userData = require('../userDatabase');

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userLogID:
 *                 type: string
 *               isVegan:
 *                 type: string
 *                 enum: [ "true", "false" ]
 *                 description: "VarChar field containing 'true' or 'false'"
 *               isVegetarian:
 *                 type: string
 *                 enum: [ "true", "false" ]
 *                 description: "VarChar field containing 'true' or 'false'"
 *               isDairyFree:
 *                 type: string
 *                 enum: [ "true", "false" ]
 *                 description: "VarChar field containing 'true' or 'false'"
 *               isLowCarb:
 *                 type: string
 *                 enum: [ "true", "false" ]
 *                 description: "VarChar field containing 'true' or 'false'"
 *               isPescetarian:
 *                 type: string
 *                 enum: [ "true", "false" ]
 *                 description: "VarChar field containing 'true' or 'false'"
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const user = req.body;
    console.log(`Creating user: ${JSON.stringify(user)}`);
    const rowsAffected = await userData.createUser(user);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});


/**
 * @swagger
 * /getUsers:
 *   get:
 *     summary: Retrieve a list of all users
 *     tags:
 *       - User
 *     description: Returns a list of users from the database
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userLogID:
 *                     type: string
 *                     description: The unique identifier for the user
 *                   isVegan:
 *                     type: string
 *                     description: Indicates if the user is vegan
 *                   isVegetarian:
 *                     type: string
 *                     description: Indicates if the user is vegetarian
 *                   isDairyFree:
 *                     type: string
 *                     description: Indicates if the user is dairy-free
 *                   isLowCarb:
 *                     type: string
 *                     description: Indicates if the user follows a low-carb diet
 *                   isPescetarian:
 *                     type: string
 *                     description: Indicates if the user is pescetarian
 *       500:
 *         description: Server error
 */
router.get('/getUsers', async (_, res) => {
    try {
      // Return a list of persons
      const users = await userData.readAll();
      console.log(`Users: ${JSON.stringify(users)}`);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err?.message });
    }
});

/**
 * @swagger
 * /{userLogID}:
 *   get:
 *     summary: Get user by userLogID
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userLogID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the user
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 # Add properties of user object here
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:userLogID', async (req, res) => { 
  try {
    const userLogID = req.params.userLogID;
    console.log(`Fetching user: ${userLogID}`);
    const user = await userData.readUser(userLogID);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

/**
 * @swagger
 * /{userLogID}:
 *   put:
 *     summary: Update user preferences
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userLogID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               # Define properties for updating user here
 *     responses:
 *       200:
 *         description: User updated successfully
 *       500:
 *         description: Server error
 */
router.put('/:userLogID', async (req, res) => {
  try {
    const userLogID = req.params.userLogID;
    const updatedUser = req.body;
    console.log(`Updating user: ${userLogID}, Data: ${JSON.stringify(updatedUser)}`);
    const rowsAffected = await userData.updateUser(userLogID, updatedUser);
    res.status(200).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

/**
 * @swagger
 * /{userLogID}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userLogID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the user
 *     responses:
 *       200:
 *         description: User successfully deleted
 *       404:
 *         description: User not found or already deleted
 *       500:
 *         description: Server error
 */
router.delete('/:userLogID', async (req, res) => {
  try {
    const userLogID = req.params.userLogID;
    console.log(`Deleting user: ${userLogID}`);
    const rowsAffected = await userData.deleteUser(userLogID);
    // Check if the deletion was successful (e.g., rowsAffected > 0)
    if ((rowsAffected.rowsAffected)[0] > 0) {
      res.status(200).json({ message: 'User successfully deleted', rowsAffected });
    } else {
      // No rows affected implies the user was not found or already deleted
      res.status(404).json({ message: 'User not found or already deleted' });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

module.exports = router;