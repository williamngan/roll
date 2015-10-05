(function() {

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


})();