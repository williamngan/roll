(function() {

  // initiate roll
  var roll = Roll.DOM( "#wrapper", "#pane", "#steps", ".step", 100 );

  var views = document.querySelectorAll( ".step" );
  views[0].className = "step curr"; // set first step's class name as "curr"


  // define how you want to track the elements as you scroll
  function track() {

    // when a step is changed
    roll.on( "step", Roll.stepHandler( roll, views ) );

    // when scrolling, just print some debugging info in an element
    roll.on( "roll", function ( step, stepProgress, position, totalProgress ) {
      var curr = (step >= 0) ? "Step "+step : "(padding)";
      var str = curr + " at " + Math.floor( stepProgress * 100 ) + "% (total: " + Math.floor( totalProgress * 100) + "%, at " + position+ "px)";
      document.querySelector( "#progress" ).textContent = str;
    } );
  }

  // start tracking
  track();

  // a global function to scroll to a specific step in the roll instance.
  window.goto = function(index) {
    var viewport = document.querySelector( "#wrapper" );
    roll.scroll(index, viewport);
  };


  // re-initiate roll when resized
  window.addEventListener("resize", function(evt) {
    roll = Roll.DOM( "#wrapper", "#pane", "#steps", ".step", 100 );
    track();
  });

})();