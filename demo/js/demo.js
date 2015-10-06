(function() {

  var roll = Roll.verticalScroller( "#wrapper", "#pane", ".step", 100 );
  var views = document.querySelectorAll( ".step" );
  var viewport = document.querySelector( "#wrapper" );
  views[0].className = "step curr";

  function track() {
    roll.on( "step", function ( curr, last ) {

      var currH = viewport.offsetHeight;
      console.log( currH );
      for (var i = 0; i < roll.steps.length; i++) {
        var cls = Roll.stepName( i, curr );
        views[i].className = "step " + cls;
        views[i].style.top = Roll.stepName( i, curr, -currH, currH, 0) +"px";
      }
    } );

    roll.on( "roll", function ( step, progress, total ) {
      var curr = (step >= 0) ? step : "(padding)";
      var str = "Step " + curr + " at " + Math.floor( progress * 100 ) + "% (total: " + total + ")";
      document.querySelector( "#progress" ).textContent = str;
    } );
  }

  track();

  window.goto = function(index) {
    roll.scroll(index, viewport);
  };


  window.addEventListener("resize", function(evt) {
    var viewpane = document.querySelector( "#steps" );

    console.log( evt, this );
    var h = window.innerHeight / 2 +"px";
    viewport.style.height = h;
    viewpane.style.height = h;
    for (var i=0; i<views.length; i++) {
      views[i].style.height = h;
    }

    roll = Roll.verticalScroller( "#wrapper", "#pane", ".step", 100 );
    track();
  });
  /*
  var viewport = document.querySelector("#wrapper");
  var viewpane = document.querySelector("#pane");
  var views = document.querySelectorAll(".step");

  var roll = new Roll( viewport.getBoundingClientRect().height );
  var pad = 100;

  function init() {

    for (var i=0; i<views.length; i++) {
      var rect = views[i].getBoundingClientRect();
      roll.addStep( Roll.chunk( rect.height, pad ) );
    }

    views[0].className = "step curr";

    viewpane.style.height = roll.getHeight()+"px";
  }

  init();


  roll.on("step", function(curr, last) {

    for (var i=0; i<roll.steps.length; i++) {
      var cls = Roll.stepName( i, curr );
      views[i].className = "step "+cls;
    }
  });

  roll.on("roll", function(step, progress, total) {
    var curr = (step >= 0) ? step : "(padding)";
    var str = "Step "+curr +" at "+ Math.floor(progress * 100) + "% (total: "+total+")";
    document.querySelector("#progress").textContent = str;
  });


  viewport.addEventListener("scroll", function(evt) {
    //console.log( viewport.scrollTop );
    roll.move( viewport.scrollTop );
  });


  var scrollInterval = -1;
  window.goto = function(index) {
    clearInterval( scrollInterval );
    scrollInterval = setInterval( function() {
      var target = roll.getStepAt(index);
      var d = (target.p1 + target.size/4)/10;
      if (Math.abs(d)<1) clearInterval(scrollInterval);
      viewport.scrollTop += d;
    }, 17);

  }
  */

})();