var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;

router.get('/', function(req, res, next) {
  if (Parse.User.current()) {
    Parse.User.logOut();
  }
  res.redirect('/');
});

module.exports = router;
