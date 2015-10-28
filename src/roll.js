var EventEmitter = require('events').EventEmitter;

/**
 * Roll simply keep tracks of steps' positions inside a viewport.
 * Apart from the static helper functions and the `scroll` function, a roll instance doesn't depend on DOM manipulation.
 * That means you can use a Roll instance in contexts other than DOM.
 */
export default class Roll extends EventEmitter {

  /**
   * Create a new Roll.
   * @param viewSize viewport size (single dimension)
   */
  constructor( viewSize ) {
    super();

    this.viewportSize = viewSize;
    this.paneSize = 0;

    // store the steps object {y1, y2, size, pad}, See Roll.chunk
    this.steps = [];

    this.pos = 0; // current position
    this.current = 0; // current step
    this.last = -1; // last step

    this.movingInterval = -1;
  }


  /**
   * Add a step object. You can also use Roll.chunk() static helper function to create a step object easily.
   * @param s an object with {p1, p2, size, pad} properties, or an array of steps object
   * @returns {Roll}
   */
  addStep(s) {

    if (!Array.isArray(s)) {
      s = [s];
    }

    // get last recorded step
    var d = s[0].p1;
    if (this.steps.length > 0 ) {
      var last = this.steps[this.steps.length-1];
      d = last.p2 + last.pad;
    }

    // append new steps
    for (var i=0; i<s.length; i++) {
      s[i].p1 = d;
      s[i].p2 = s[i].p1 + s[i].size;
      d = s[i].p2 + s[i].pad;
      this.steps.push( s[i] );
    }

    // recalculate pane size
    this.getHeight( true );

    return this;
  }


  /**
   * Get step by index
   * @param index
   */
  getStepAt( index ) {
    return this.steps[ Math.max( 0, Math.min( this.steps.length-1, index) )];
  }


  /**
   * Calculate and return current step. When padding > 0, step will be -1 when current progress is on the padding area. This allows you to check progress against padding.
   * @returns {number}
   */
  getStep() {
    for (var i=0; i<this.steps.length; i++) {
      var st = this.steps[i];
      if (st.p1 >= -this.viewportSize && st.p2 <= st.size ) {
        this.current = i;
        return i;
      }
    }
    return -1;
  }

  /**
   * Get current progress within the current step
   * @returns 0-1 if step.pad is 0. Otherwise it will range from negative to positive.
   */
  getStepProgress() {
    var curr = this.steps[ this.current ];
    return 1 - (curr.p2 / curr.size);
  }


  /**
   * Get current position
   * @returns {number|*}
   */
  getPosition() {
    return this.pos;
  }

  /**
   * Get total height of the pane (including padding)
   * @returns {*}
   */
  getHeight( recalc = false ) {
    if (recalc ) this.paneSize = this.steps.reduce( (a,b) => a+b.size+b.pad, 0 );
    return this.paneSize;
  }

  /**
   * Get viewport's height (same as this.viewportSize)
   * @returns {*}
   */
  getViewportHeight() {
    return this.viewportSize;
  }


  /**
   * Move the roll. This will emit two events `roll(step, currProgress, currPosition, totalProgress)` and `step(curr, last)`
   * @param pos new position
   * @returns {Roll}
   */
  move( pos ) {
    var last = this.pos;
    this.pos = -pos;
    var diff = this.pos - last;

    for (var i=0; i<this.steps.length; i++) {
      let s = this.steps[i];
      s.p1 += diff;
      s.p2 = s.p1 + s.size;
    }

    var curr = this.getStep();
    var progress = this.getStepProgress();
    this.emit("roll", curr, progress, pos, pos/(this.paneSize-this.viewportSize) );

    if (curr != this.last && curr >= 0) {
      this.emit("step", curr, this.last, this.viewportSize );
      this.last = curr;
    }

    return this;
  }


  /**
   * Animated scrolling a DOM element
   * @param index step index
   * @param scrollPane a DOM element with scrolling (overflow-y).
   * @param speed optional speed of animated scroll. Defaults to 0.1. Larger is faster
   * @param isVertical optional boolean to indicate horizontal or vertical scroll
   */
  scroll( index, scrollPane, speed=0.1, isVertical=true) {
    if (!scrollPane || scrollPane.scrollTop == null) throw "scrollPane parameter requires a DOM element with scrollTop property";
    clearInterval( this.movingInterval );
    var _temp = Number.NEGATIVE_INFINITY;
    var dir = (isVertical) ? "scrollTop" : "scrollLeft";

    this.movingInterval = setInterval( () => {
      var target = this.getStepAt(index);
      var d = (target.p1 + target.size/4) * speed;
      scrollPane[dir] += d;
      if (Math.abs(d)<1 || _temp === scrollPane[dir]) clearInterval(this.movingInterval);
      _temp = scrollPane[dir];
    }, 17);
  }


  /**
   * A convenient static function to create a step object
   * @param size chunk size
   * @param pad optional padding (default to 0)
   * @returns {{p1: number, p2: *, size: *, pad: number}}
   */
  static chunk( size, pad=0) {
    return {
      p1: 0,
      p2: size,
      size: size,
      pad: pad
    }
  }


  /**
   * A convenient static function to compare a step with current step, and transform it to a name
   * @param step the step to check
   * @param currStep current step
   * @param prev optional class name for step is < currStep. Defaults to "prev"
   * @param next optional class name for step is > currStep. Defaults to "next"
   * @param match optional class name for step = currStep. Defaults to "curr"
   * @returns {string}
   */
  static stepName( step, currStep, prev="prev", next="next", match="curr") {
    return (step === currStep) ? match : ( (step < currStep) ? prev : next );
  }


  /**
   * Static helper to get a handle function for Roll's "step" event. The handler function will add class names to each step element based on current step value.
   * @param roll a Roll instance
   * @param views a list of DOM elements which are the steps
   * @param prev optional class name for step is < currStep. Defaults to "prev"
   * @param next optional class name for step is > currStep. Defaults to "next"
   * @param match optional class name for step = currStep. Defaults to "curr"
   * @returns {Function}
   */
  static stepHandler( roll, views, prev="prev", next="next", match="curr", trackTopPos=false) {
    return function ( curr, last, viewportHeight ) {
      for (var i = 0; i < roll.steps.length; i++) {
        var cls = Roll.stepName( i, curr, prev, next, match );
        views[i].className = "step " + cls;

        // if steps have different sizes, recalc top position and set style
        if (trackTopPos) {
          var p = (cls===prev) ?  roll.steps[i].size * -1 : ((cls===next) ? viewportHeight : 0);
          views[i].style.top = p+"px";
        }
      }
    }
  }


  /**
   * Static method to create a Roll instance with DOM elements
   * @param viewPortID id of viewport element, which is the parent of the viewPane. eg, "#viewport"
   * @param viewPaneID id of view pane element, eg, "#pane"
   * @param viewBox id of view box element, which is the parent the viewClass elements. eg, "#steps"
   * @param viewClass id of each step or slide element, eg, ".step"
   * @param pad optional padding between steps. Defaults to 0.
   * @returns the roll instance which you can listen for "step" and "roll" event via `roll.on(...)`
   */
  static DOM( viewPortID, viewPaneID, viewBoxID, viewClass, pad=0 ) {

    var viewport = document.querySelector( viewPortID );
    var viewpane = viewport.querySelector( viewPaneID );
    var viewbox = document.querySelector( viewBoxID );
    var views = viewbox.querySelectorAll( viewClass );

    if (!viewport || !viewpane) throw `Cannot find ${viewPortID} or ${viewPaneID} element id.`
    if (!viewClass) throw `Cannot find ${viewClass} element class name`;

    // create roll instance based on viewport element height
    var roll = new Roll( viewport.getBoundingClientRect().height );

    // add each viewClass element as a step
    for (var i = 0; i < views.length; i++) {
      var rect = views[i].getBoundingClientRect();
      roll.addStep( Roll.chunk( rect.height, pad ) );
    }

    // update viewpane height based on steps
    viewpane.style.height = roll.getHeight()+"px";

    // update viewbox width to account for scrollbar
    viewbox.style.width = viewpane.getBoundingClientRect().width+"px";

    // track scroll
    viewport.addEventListener("scroll", function(evt) {
      roll.move( viewport.scrollTop );
    });

    return roll;
  }

}
