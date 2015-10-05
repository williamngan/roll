(function() {

  var viewport = document.querySelector("#wrapper");
  var viewpane = document.querySelector("#pane");
  var views = document.querySelectorAll(".step");

  var roll = new Roll( viewport.getBoundingClientRect().height );
  var pad = 20;

  function init() {

    for (var i=0; i<views.length; i++) {
      var rect = views[i].getBoundingClientRect();
      console.log( rect.height );
      roll.addStep( Roll.chunk( rect.height, pad ) );
    }

    viewpane.style.height = roll.getHeight()+"px";

  }

  init();


  roll.on("step", function(curr, last) {

    for (var i=0; i<roll.steps.length; i++) {
      var cls = Roll.stepName( i, curr );
      views[i].className = "step "+cls;
      console.log( views[i].className );
    }
  });


  viewport.addEventListener("scroll", function(evt) {
    //console.log( viewport.scrollTop );
    roll.move( viewport.scrollTop );
  });


})();