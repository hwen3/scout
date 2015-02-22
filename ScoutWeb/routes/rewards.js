var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;

router.get('/', function(req, res, next) {
  if (Parse.User.current()) {
    res.render('rewards', { title: 'Scout', jumbotron: 'Rewards', filename: 'rewards' });
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
          res.json(rewardList);
        },
        error: function (error) {
          var msg = 'ERROR: cannot query rewards for business '+business['id'];

          console.log(msg);
          console.log(error.message);

          res.status(400).send(msg);
        }
      });
    },
    error: function (error) {
      var msg = 'ERROR: Unable to query business for owner'+Parse.User.current();

      console.log(msg);
      console.log(error.message);

      res.status(400).send(msg);
    }
  })
});

router.post('/addreward', function (req, res) {
  var RewardObj = Parse.Object.extend('Reward');
  var BusinessObj = Parse.Object.extend('Business');

  var description = req.body['description'];
  var points = parseInt(req.body['points']);

  var businessQuery = new Parse.Query(BusinessObj);
  businessQuery.equalTo('owner', Parse.User.current());
  businessQuery.first().then( function(business) {
  
    var reward = new RewardObj();
    reward.set("description", description);
    reward.set("points", points);
    reward.set("business", business);

    reward.save(null, {
      success: function(reward) {
        console.log('Reward has been successfully saved.');

        res.status(200).send();
      },
      error: function(reward, error) {
        console.log('ERROR: Unable to save reward.');
        console.log(error.message);

        res.status(400).send('Reward could not be successfully saved.');
      }
    });
  }, function(error) {
    console.log('ERROR: Could not query business');
    console.log(error.message);
    
    res.status(400).send('Unable to find the current business.');
  });
});


router.post('/removereward', function (req, res) {
  var rewardObjectId = req.body['objectid'];

  var RewardObj = Parse.Object.extend('Reward');
  var query = new Parse.Query(RewardObj);

  query.get(rewardObjectId, {
    success: function (reward) {
      reward.destroy();
      console.log('Reward has been successfully deleted.');

      res.status(200).send();
    },
    error: function (error) {
      console.log('ERROR: Cannot delete reward or is already deleted.');
      console.log(error.message);

      res.status(400).send('Unable to delete reward.');
    }
  });
});

router.put('/editreward', function (req, res) {
  var rewardId = req.body['objectId'];
  var rewardDescription = req.body['description'];
  var rewardPoints = req.body['points'];

  var RewardObj = Parse.Object.extend('Reward');
  var query = new Parse.Query(RewardObj);

  query.get(rewardId, {
    success: function (reward) {
      reward.set('description', rewardDescription);
      reward.set('points', parseInt(rewardPoints));

      reward.save(null , {
        success: function (reward) {
          console.log('Reward has been successfully updated.');
          
          res.status(200).send();
        },
        error: function(reward, error) {
          console.log('ERROR: Cannot update reward '+rewardId);
          console.log(error.message);

          res.status(400).send('Unable to update the current reward.')
        }
      });
    },
    error: function (error) {
      console.log('ERROR: Cannot query reward '+rewardId);

      res.status(400).send('Unable to find the current reward.');
    }
  });
});


module.exports = router;
