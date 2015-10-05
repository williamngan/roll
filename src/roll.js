var EventEmitter = require("event-emitter");

class Roll extends EventEmitter {

  constructor( steps, viewHeight ) {
    super();

    this.steps = [];

    this.y = 0;
    this.viewport = viewHeight;
    this.current = 0;
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


  move( y ) {
    var last = this.y;
    this.y = -y;
    var diff = this.y - last;

    for (var s of this.steps) {
      s.y1 += diff;
      s.y2 = s.y1 + s.size;
    }

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