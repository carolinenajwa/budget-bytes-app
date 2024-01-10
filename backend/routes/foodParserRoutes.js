const express = require('express');
const router = express.Router();


/**
 * @swagger
 * /food-parser:
 *   get:
 *     summary: Get nutrient values for a given food ingredient
 *     tags: [Food Parser]
 *     parameters:
 *       - in: query
 *         name: ingr
 *         schema:
 *           type: string
 *         required: true
 *         description: The food ingredient to parse
 *     responses:
 *       200:
 *         description: Successful response with nutrient values
 *         content:
 *           application/json:
 *             example:
 *               nutrients:
 *                 calories: 100
 *                 protein: 10
 *                 carbs: 20
 *                 fat: 5
 *       404:
 *         description: No parsed data found
 *         content:
 *           application/json:
 *             example:
 *               error: No parsed data found.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Error occurred during food parsing.
 */
router.get('/', async (req, res) => {
    const { ingr } = req.query;

    try {
        // Fetch data directly from the Edamam API using a GET request
        const response = await fetch(`https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(ingr)}&app_id=aecae770&app_key=c7a908a263b49dd16f16fe5ed1f7065e`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Parse the JSON response
        const data = await response.json();

        // Check if the response has the "parsed" property and "food" array
        if (data.parsed && data.parsed.length > 0) {
            // Access the nutrients property of the first item in the "parsed" array
            const nutrients = data.parsed[0].food.nutrients;

            // Respond with nutrient values
            res.json({ nutrients });
        } else {
            res.status(404).json({ error: 'No parsed data found.' });
        }
    } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({ error: 'Error occurred during food parsing.' });
    }
});

// Export the router
module.exports = router;