/**
 * A simple server to serve JSON data from other repos:
 * - ../trains-data
 * - ../tools-data
 */

const path = require('path');
const express = require('express');

module.exports = function (app) {
  app.use(
    '/trains-data',
    express.static(path.join(__dirname, '../../trains-data'))
  );
  app.use(
    '/pocsag-data',
    express.static(path.join(__dirname, '../../pocsag-data'))
  );
};
