var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { head: 'Local Library',title: 'My First Express app', body:'This is my first attempt at Express and EJS' });
});

module.exports = router;
