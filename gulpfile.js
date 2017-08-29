const gulp = require("gulp");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const browserSync = require('browser-sync').create();


gulp.task('styles', () => {
  return gulp.src('./dev/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./public/styles/'))
    .pipe(browserSync.reload({
    	stream: true
    }))
});

gulp.task('scripts', () => {
	return gulp.src('./dev/scripts/*.js')
	 .pipe(babel({
	 	presets:['es2015']
	 }))
	 .pipe(gulp.dest('./public/scripts'))
});

gulp.task('html', () => {
	return gulp.src('./dev/*.html')
	 .pipe(gulp.dest('./public/'))
	 .pipe(browserSync.reload({
	 	stream: true
	 }))
})

gulp.task('watch',["browserSync", "styles", "html"], () => {
	gulp.watch("./dev/*.html", ["html"], browserSync.reload);
	gulp.watch("./dev/styles/**/*.scss", ['styles']);
	gulp.watch("./dev/scripts/.js", browserSync.reload,['scripts']);
})

gulp.task('browserSync', function() {
  browserSync.init({
    port: 8383,
    server: {
      baseDir: 'public'
    },
    ui: {
      port:8181
    }

  })
});

gulp.task('default',['watch','styles','scripts','browserSync']);