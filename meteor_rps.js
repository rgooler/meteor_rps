if (Meteor.isClient) {
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
  this.render('player', {
    data: {
      _player: 1
    }
  });
});

Router.route('/player2', function() {
  this.render('player', {
    data: {
      _player: 2
    }
  });
});
