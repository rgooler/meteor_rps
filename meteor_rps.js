Game = new Mongo.Collection("game");

if (Meteor.isClient) {
  Session.setDefault('player', 0);

  Template.player.helpers({
    player: function () {
      return Session.get("player");
    }
  });

  Template.player.events({
    'click button.rock': function () { 
      console.log("Player " + Session.get('player') + " played rock");
    },
    'click button.paper': function () { 
      console.log("Player " + Session.get('player') + " played paper");
    },
    'click button.scissors': function () { 
      console.log("Player " + Session.get('player') + " played scissors");
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

// Use ironrouter to setup routes
Router.configure({
  layoutTemplate: 'main'
});

// Basic help/navigation page on initial view
Router.route('/', {
  template: 'home'
});

// Player pages
Router.route('/player1', function() {
  Session.set("player", 1);
  this.render('player');
});

Router.route('/player2', function() {
  Session.set("player", 2);
  this.render('player');
});
