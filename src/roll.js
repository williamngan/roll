var EventEmitter = require('events').EventEmitter;

class Roll extends EventEmitter {

  /**
   * Create a new Roll.
   * @param viewSize viewport size (single dimension)
   */
  constructor( viewSize ) {
    super();

    this.viewport = viewSize;

    // store the steps object {y1, y2, size, pad}, See Roll.chunk
    this.steps = [];

    this.pos = 0; // current position
    this.current = 0; // current step
    this.last = -1; // last step
  }


  /**
   * Add a step object. You can also use Roll.chunk() static helper function to create a step object easily.
   * @param s an object with {y1, y2, size, pad} properties, or an array of steps object
   * @returns {Roll}
   */
  addStep(s) {
    if (Array.isArray( s )) {
      this.steps = this.steps.concat( s );
    } else {
      this.steps.push( s );
    }

    var d=null;
    for (var st of this.steps) {
      st.p1 = (d==null) ? st.p1 : d;
      st.p2 = st.p1 + st.size;
      d = st.p2 + st.pad;
    }

    return this;
  }


  /**
   * Calculate and return current step. When padding > 0, step will be -1 when current progress is on the padding area. This allows you to check progress against padding.
   * @returns {number}
   */
  getCurrent() {
    for (var i=0; i<this.steps.length; i++) {
      var st = this.steps[i];
      if (st.p1 >= -this.viewport && st.p2 <= this.viewport ) {
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
  getCurrentProgress() {
    var curr = this.steps[ this.current ];
    return 1 - (curr.p2 / curr.size);
  }


  /**
   * Get total height of the pane (including padding)
   * @returns {*}
   */
  getHeight() {
    return this.steps.reduce( (a,b) => a+b.size+b.pad, 0 );
  }


  /**
   * Move the roll. This will emit two events `roll(step, currProgress, totalProgress)` and `step(curr, last)`
   * @param pos new position
   * @returns {Roll}
   */
  move( pos ) {
    var last = this.pos;
    this.pos = -pos;
    var diff = this.pos - last;

    for (var s of this.steps) {
      s.p1 += diff;
      s.p2 = s.p1 + s.size;
    }

    var curr = this.getCurrent();
    var progress = this.getCurrentProgress();
    this.emit("roll", curr, progress, this.current+Math.min( 1, Math.max(0, progress)) );

    if (curr != this.last && curr >= 0) {
      this.emit("step", curr, this.last );
      this.last = curr;
    }

    return this;
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
   * @param prev the name if step is < currStep. Defaults to "prev"
   * @param next the name if step is > currStep. Defaults to "next"
   * @param match the name if step = currStep. Defaults to "curr"
   * @returns {string}
   */
  static stepName( step, currStep, prev="prev", next="next", match="curr") {
    return (step === currStep) ? match : ( (step < currStep) ? prev : next );
  }

}


module.exports = Roll;
if (window) window.Roll = Roll;