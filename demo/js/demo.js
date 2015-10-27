(function() {

  // initiate roll
  var roll = Roll.DOM( "#wrapper", "#pane", "#steps", ".step", 100 );

  var views = document.querySelectorAll( ".step" );
  views[0].className = "step curr"; // set first step's class name as "curr"


  // define how you want to track the elements as you scroll
  function track() {

    // vendor prefix for old browsers
    function _vendor( elem, prop, val ) {
      var vs = ["webkit", "Webkit", "Moz", "ms"];
      for (var i=0; i<vs.length; i++) {
        elem.style[ vs[i]+prop ] = val;
      }
    }

    // when a step is changed
    roll.on( "step", Roll.stepHandler( roll, views, "prev", "next", "curr", true ) );

    // when scrolling, just print some debugging info in an element
    roll.on( "roll", function ( step, stepProgress, position, totalProgress ) {
      var curr = (step >= 0) ? "Step "+(step+1) : "(padding)";

      var vals = {
        numSteps: roll.steps.length,
        viewportHeight: roll.getViewportHeight(),
        paneHeight: roll.getHeight(),
        currStep: curr,
        currPos: position + "px",
        currStepProgress: Math.floor( stepProgress * 100 ) + "%",
        totalProgress: Math.floor( totalProgress * 100) + "%"
      };

      for (var k in vals) {
        var el = document.querySelector("#"+k);
        if (el) {
          el.textContent = vals[k];
        }
      }

      if (step >= 0) {
        var currStep = document.querySelector( "#s" + step );
        var ings = currStep.querySelectorAll( ".ingredient" );
        for (var i = 0; i < ings.length; i++) {
          var ang1 = parseInt( ings[i].getAttribute( "data-angle" ) );
          var ang2 = parseInt( ings[i].getAttribute( "data-rotate" ) );
          //var tm = "rotate(" + (ang1 + (stepProgress*0.2) * ang2 ) + "deg) scale(" + (0.25 + totalProgress * 0.5) + ")";
          var tm = "scale(" + (0.25 + totalProgress * 0.5) + ") translate(0, "+Math.floor(-ang1*stepProgress*3)+"px)";
          ings[i].style.transform = tm;
          _vendor( ings[i], "Transform", tm );
        }
      }

      var progress = document.querySelector("#progress");
      progress.style.height = Math.floor(roll.getViewportHeight() * totalProgress) + "px";

    });
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
    goto(0);
  });

  goto(0);

})();