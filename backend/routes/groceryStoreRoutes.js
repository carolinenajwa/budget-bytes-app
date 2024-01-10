const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /{address}:
 *   get:
 *     summary: Retrieve coordinates of an address from the Google Geocoding API
 *     tags: [GroceryStore]
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Given address
 *     responses:
 *       404:
 *         description: No coordinates were found for the given address
 *       500:
 *         description: Internal error
 */
// Define an API endpoint to fetch coordinates from Google Geocoding API
router.get('/:address', async (req, res) => {
  const address = req.params.address;
  const OPENCAGE_GEOCODING_API_KEY = '0ade0ea9cd23417480b5240558db5f48';

  try {
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_GEOCODING_API_KEY}`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const { lat, lng } = result.geometry;

      // Return latitude and longitude in the response
      res.json({ latitude: lat, longitude: lng });
    } else {
      res.status(404).json({ error: 'No results found for the entered address.' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /mapdata/{latitude}/{longitude}:
 *   get:
 *     summary: Retrieve a map of grocery stores near given coordinates
 *     tags: [GroceryStore]
 *     parameters:
 *       - in: path
 *         name: latitude
 *         schema:
 *          type: string
 *         required: true
 *         description: coordinates of an address
 *       - in: path
 *         name: longitude
 *         schema:
 *          type: string
 *         required: true
 *         description: longitude of an address
 *     responses:
 *       500:
 *         description: Internal error
 */
router.get('/mapdata/:latitude/:longitude', async (req, res) => {
    const { latitude, longitude } = req.params;
    const GEOAPIFY_API_KEY = '42d8ca6fe1d34c1ba2f69cac1818942e';
  
    try {
      const mapData = {
        center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        markers: [],
      };
  
      // Add the user's current location as a marker
      mapData.markers.push({
        position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        title: 'Your Current Location',
      });
  
      // Fetch nearby supermarkets
      const response = await fetch(`https://api.geoapify.com/v2/places?categories=commercial.supermarket&filter=circle:${longitude},${latitude},5000&bias=proximity:${longitude},${latitude}&limit=20&apiKey=${GEOAPIFY_API_KEY}`);
      const result = await response.json();
  
      // Process data and add markers for each nearby supermarket
      result.features.forEach(place => {
        const markerTitle = `${place.properties.name}<br>${place.properties.address_line2}`;
        mapData.markers.push({
          position: { lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] },
          title: markerTitle,
        });
      });
  
      res.json(mapData);
    } catch (error) {
      console.error('Error fetching map data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  

module.exports = router;

