var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;

router.get('/', function(req, res, next) {
  if (Parse.User.current()) {
    res.render('rewards', { title: 'Scout' , jumbotron: 'Rewards' });
  } else {
    res.redirect('/');
  }
});

router.get('/getrewards', function(req, res, next) {
  var BusinessObj = Parse.Object.extend('Business');
  var businessQuery = new Parse.Query(BusinessObj);

  businessQuery.equalTo('owner', Parse.User.current());
  businessQuery.first({
    success: function (business) {
      var RewardObj = Parse.Object.extend('Reward');
      var rewardQuery = new Parse.Query(RewardObj);

      rewardQuery.equalTo('business', business);

      rewardQuery.find({
        success: function (rewardList) {
          console.log(rewardList);
          res.json(rewardList);
        },
        error: function (error) {
          console.log('ERROR: cannot query rewards for business '+business['id']);
          console.log(error.message);
        }
      });
    },
    error: function (error) {
      console.log('ERROR: Unable to query business for owner'+Parse.User.current());
      console.log(error.message);
    }
  })
});

router.post('/removereward', function (req, res) {
  var rewardObjectId = req.body['objectid'];

  var RewardObj = Parse.Object.extend('Reward');
  var query = new Parse.Query(RewardObj);

  query.get(rewardObjectId, {
    success: function (reward) {
      reward.destroy();
      console.log('Reward has been successfully deleted.');

      res.redirect('/rewards');
    },
    error: function (error) {
      console.log('ERROR: Cannot delete reward.');
      console.log(error.message);

      res.redirect('/rewards');
    }
  });
});

module.exports = router;
