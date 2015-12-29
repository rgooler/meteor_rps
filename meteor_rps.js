Game = new Mongo.Collection("game");

if (Meteor.isClient) {
  Session.setDefault('player', 0);
  Session.setDefault('p1ready', false);
  Session.setDefault('p2ready', false);

  // Really lazy way to update both player's ready status
  // Better would be a publish/subscribe, but I couln't get it to work
  // So at least I stop polling when we know who played what.

  // Would be good to make this only happen on the player page

  Template.player.created = function() {
    set_intervals();
  };

  Template.player.events({
    'click button.rock': function (){
      play_move(Session.get('player'), 'rock');
    }, 
    'click button.paper': function (){
      play_move(Session.get('player'), 'paper');
    }, 
    'click button.scissors': function (){
      play_move(Session.get('player'), 'scissors');
    }
  });



  // --[ Client functions] ------------
  function set_intervals(){
      try {
        p1check = setInterval(function () {
          Meteor.call('isP1Ready', function (err, count){
            Session.set('p1ready', count)
            // Stop checking if player has played. :D
            if(count == 1){ Meteor.clearInterval(p1check); }
            game_check(Session.get('player'));
          });
        }, 1000);

        p2check = setInterval(function () {
          Meteor.call('isP2Ready', function (err, count){
            Session.set('p2ready', count)
            // Stop checking if player has played. :D
            if(count == 1){ Meteor.clearInterval(p2check); }
            game_check(Session.get('player'));
          });
        }, 1000);
      } catch(err) {
        location.reload();
      }
    }
  }

  function play_move(player, move) {         
    // Prevent mongo injection by checking player number
    if((player != 1 && player != 2)){ return; }

    // Notify server of move
    Meteor.call('play_move', player, move);

    // Prettify ui
    if(move != 'rock') {
      document.getElementById("rock").style.visibility = "hidden";
    }
    if(move != 'paper') {
      document.getElementById("paper").style.visibility = "hidden";
    }
    if(move != 'scissors') {
      document.getElementById("scissors").style.visibility = "hidden";
    }

    // Notify opponent
    game_check(player);
  }

  function set_opponent_style(style){
    document.getElementById("opponent").className = style
  }

  function game_check(player){
    var opponent = 1;
    if(player == 1){ 
      var p_ready = Session.get('p1ready');
      var o_ready = Session.get('p2ready');
    } else {
      var p_ready = Session.get('p2ready');
      var o_ready = Session.get('p1ready');
    }
    
    if( ! o_ready ) {
      set_opponent_style("fa fa-cog fa-spin fa-3x");
    } else {
      // Set 'ready', then override
      set_opponent_style("fa fa-check fa-3x");
      if ( p_ready ) {
        // Both players are ready! Get the moves!
        p1_move = Game.find({player: 1}).fetch()[0]['move'];
        p2_move = Game.find({player: 2}).fetch()[0]['move'];

        //Select opponent's move
        o_move = p1_move;
        if(player == 1) { o_move = p2_move}
        
        if (o_move == 'rock') {
          set_opponent_style("fa fa-hand-rock-o fa-3x fa-rotate-180");
        }
        if (o_move == 'paper') {
          set_opponent_style("fa fa-hand-paper-o fa-3x fa-rotate-180");
        }
        if (o_move == 'scissors') {
          set_opponent_style("fa fa-hand-scissors-o fa-3x fa-rotate-270");
        }

        // Score game

        // Refresh to start a new game
        Meteor.call('game_cleanup', function(err, response) {});

        setTimeout(function(){
          Session.set('p1ready', false);
          Session.set('p2ready', false);
          set_opponent_style("fa fa-cog fa-spin fa-3x");
          document.getElementById("rock").style.visibility = "visible";
          document.getElementById("paper").style.visibility = "visible";
          document.getElementById("scissors").style.visibility = "visible";
          set_intervals();
        }, 5000);
        
      }
    }
  }


if (Meteor.isServer) {
  Meteor.startup(function () {
    // Reset game state on startup
    Meteor.call('game_cleanup',function(err, response) {});
  });

  Meteor.methods({
    isP1Ready: function () {
      try {
        return Game.find({player: 1}).count();
      } catch(err) {
        return 0;
      }
    },
    isP2Ready: function () {
      try {
        return Game.find({player: 2}).count();
      } catch(err) {
        return 0;
      }
    },
    game_cleanup: function() {
      Game.remove({});
    },
    play_move: function(player, move) {
      if( Game.find({player: player}).count() ) { return; }
      Game.insert({
        player: player,
        move: move
      });
    }
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
