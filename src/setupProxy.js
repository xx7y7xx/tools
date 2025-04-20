const path = require('path');
const express = require('express');

module.exports = function (app) {
  app.use(
    '/pocsag-data',
    express.static(path.join(__dirname, '../../pocsag-data'))
  );
};
