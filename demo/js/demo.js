(function() {

  var viewport = document.querySelector("#wrapper");
  var viewpane = document.querySelector("#steps");
  var views = document.querySelectorAll(".step");

  var roll = new Roll( viewport.getBoundingClientRect().height );
  var pad = 20;

  function init() {

    for (var i=0; i<views.length; i++) {
      var rect = views[i].getBoundingClientRect();
      roll.addStep( Roll.chunk( rect.height, pad ) );
    }

    viewpane.style.height = roll.getHeight()+"px";
  }

  init();


  roll.on("roll", function(a,b,c) {
    console.log(a,b,c);
  });


  viewport.addEventListener("scroll", function(evt) {
    console.log( viewport.scrollTop );
    roll.move( viewport.scrollTop );
  });


})();