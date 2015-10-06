var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

var rename = require('gulp-rename');
var uglify = require('gulp-uglify');


// Define Paths
var path = {
  src: {
    js: "./src/js/",
    css: "./src/css/"
  },
  dist: {
    js: "./dist/js/",
    css: "./dist/css/",
    path: "./dist/"
  }
};


function handleError( error ) {
  gutil.log( error.stack );
  this.emit( 'end' );
}


function compile(watch) {
  var bundler = watchify(browserify('./src/roll.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', handleError)
      .pipe(source('roll.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }

  if (watch) {
    bundler.on('update', function() {
      gutil.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
}


gulp.task('min', function() {
  return gulp.src( "./dist/roll.js" )
    .pipe( rename('roll.min.js') )
    .pipe( uglify() )
    .pipe( gulp.dest( "./dist" ) )

});

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);

/*
gulp.task('default', ["watch"]);

// Watch
gulp.task('watch', function() {
  gulp.watch( path.src.js+"/*.js", ['es6']);
});

// ES6 Babel
gulp.task('es6', function () {
    return gulp.src( path.src.js+"*.js" )
        .pipe(babel({ modules: "common"})).on('error', handleError)
        .pipe(gulp.dest( path.dist.js ));
});
*/