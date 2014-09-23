function registerName() {
  socket.emit('register', { name: $(".loginname").val() , email: "franz@aol.de"} );
  console.log($(".loginname").val());
}

$(document).ready( function() {

  $(".submit").click( function() {
    registerName();
    $( ".name" ).fadeOut( "slow", function() {
    // Animation complete.
    });
  });
  $(".what").click( function() {
    $( "#about" ).fadeIn( "slow", function() {
    });
  });
  $("#about").click( function() {
    $( "#about" ).fadeOut( "slow", function() {
    });
  });
});
