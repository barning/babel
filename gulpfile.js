var gulp = require('gulp'),
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
rename = require('gulp-rename'),
cssmin = require('gulp-cssmin'),
jshint = require('gulp-jshint'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
addsrc = require('gulp-add-src'),
watch = require('gulp-watch'),
livereload = require('gulp-livereload');
 
 
gulp.task('sass', function() {
gulp.src('./scss/style.scss')
.pipe(sass())
.pipe(autoprefixer("last 2 version", "ie 9"))
//.pipe(cssmin())
//.pipe(rename({suffix: '.min'}))
.pipe(gulp.dest('./css/'));
});
 
 
gulp.task('js', function() {
gulp.src('./js/scripts.js')
.pipe(jshint())
.pipe(jshint.reporter('default'))
.pipe(addsrc('./js/*/*.js'))
.pipe(concat('scripts.min.js'))
.pipe(uglify())
.pipe(gulp.dest('./js/'));
});
 
 
gulp.task('watch', function() {
livereload.listen();
 
gulp.watch('./scss/**/*.scss', ['sass']).on('change', livereload.changed);
gulp.watch('./js/**/*.js', ['js']).on('change', livereload.changed);
gulp.watch('./**/*.php').on('change', livereload.changed);
});
 
 
gulp.task('build', ['sass', 'js']);