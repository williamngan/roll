var EventEmitter = require('events').EventEmitter;

class Roll extends EventEmitter {

  constructor( viewHeight ) {
    super();

    this.steps = [];

    this.p = 0;
    this.viewport = viewHeight;
    this.current = 0;
    this.last = -1;
  }


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


  getCurrentProgress( p ) {
    var len = this.steps.length-1;
    var curr = this.steps[ this.current ];
    var next = (this.current == len) ? {p1: this.steps[len].p2 + this.steps[len].pad} : this.steps[this.current+1];
    return (p-curr.p1) / (next.p1-curr.p1) - this.current;
  }



  getHeight() {
    return this.steps.reduce( (a,b) => a+b.size+b.pad, 0 );
  }



  move( pos ) {
    var last = this.p;
    this.p = -pos;
    var diff = this.p - last;

    for (var s of this.steps) {
      s.p1 += diff;
      s.p2 = s.p1 + s.size;
    }

    var curr = this.getCurrent();
    this.emit("roll", curr, this.getCurrentProgress(pos) );

    if (curr != this.last && curr >= 0) {
      this.emit("step", curr, this.last );
      this.last = curr;
    }

    return this;
  }


  static chunk( size, pad=0) {
    return {
      p1: 0,
      p2: size,
      size: size,
      pad: pad
    }
  }

  static stepName( step, currID, prev="prev", next="next", match="curr") {
    return (step === currID) ? match : ( (step < currID) ? prev : next );
  }

}


module.exports = Roll;
if (window) window.Roll = Roll;