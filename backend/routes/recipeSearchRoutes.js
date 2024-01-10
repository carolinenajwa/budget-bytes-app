const express = require('express');
const router = express.Router();
const cors = require('cors');

router.use(express.json());
router.use(cors());

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Search for occurences of a word in a recipe
 *     tags: 
 *       - Recipe Search
 *     parameters:
 *       - name: recipe
 *         in: body
 *         description: The text to search for occurrences.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             recipe:
 *               type: string
 *               description: The recipe text
 *               default: "Spaghetti Bolognese, Classic Italian dish with a rich meat sauce., Cook pasta, make sauce, combine., 15, 30, Italian, Easy, [{name: Pasta, quantity: 200, unit: g}, {name: Ground Beef, quantity: 300, unit: g}, {name: Tomato Sauce, quantity: 400, unit:ml"
 *             searchWord:
 *               type: string
 *               description: The word to search for in the recipe
 *               default: "sauce"
 *     responses:
 *       '200':
 *         description: Successful response with word count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 occurrences:
 *                   type: integer
 *                   description: Number of occurrences of the search word in the recipe
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.post('/', (req, res) => {
  try {
    const { recipe, searchWord } = req.body;

    if (!recipe || !searchWord) {
      return res.status(400).json({ error: 'Both recipe and searchWord are required in the request body.' });
    }

    // Function to find occurrences of a word in a text
    const findOccurrences = (text, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = Array.from(text.matchAll(regex), match => match.index);
      return { occurrences: matches.length};
    };

    // Find occurrences of the searchWord in the recipe
    const { occurrences} = findOccurrences(recipe, searchWord);

    // Send the response with the count and positions
    res.json({ occurrences});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;