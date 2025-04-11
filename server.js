/**
 * File: server.js
 * Description: This is a simple server that serves the pocsag-data directory
 * Usage: node server.js
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the pocsag-data directory
app.use('/data', express.static(path.join(__dirname, '../pocsag-data')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
