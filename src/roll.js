var EventEmitter = require('events').EventEmitter;

class Roll extends EventEmitter {

  constructor( viewHeight ) {
    super();

    this.steps = [];

    this.y = 0;
    this.viewport = viewHeight;
    this.current = 0;
  }


  addStep(s) {
    if (Array.isArray( s )) {
      this.steps = this.steps.concat( s );
    } else {
      this.steps.push( s );
    }
    return this;
  }


  getCurrent() {
    for (var i=0; i<this.steps.length; i++) {
      var st = this.steps[i];
      if (st.y1 < this.viewport && st.y2 > this.viewport ) {
        this.current = i;
        return i;
      }
    }
    return -1;
  }


  getCurrentProgress( p ) {
    var len = this.steps.length-1;
    var curr = this.steps[ this.current ];
    var next = (this.current == len) ? {y1: this.steps[len].y2 + this.steps[len].pad} : this.steps[this.current+1];
    return (p-curr.y1) / (next.y1-curr.y1) - this.current;
  }



  getHeight() {
    var h = 0;
    for (var s of this.steps) {
      h += (s.size + s.pad);
    }
    return h;
  }


  move( y ) {
    var last = this.y;
    this.y = -y;
    var diff = this.y - last;

    for (var s of this.steps) {
      s.y1 += diff;
      s.y2 = s.y1 + s.size;
    }

    this.emit("roll", this.getCurrent(), this.getCurrentProgress(y) );

    return this;
  }


  static chunk( size, pad=0) {
    return {
      y1: 0,
      y2: size,
      size: size,
      pad: pad
    }
  }

}


module.exports = Roll;
if (window) window.Roll = Roll;