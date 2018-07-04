var gulp = require('gulp'),//
    watch = require('gulp-watch'),//
    autoprefixer = require('gulp-autoprefixer'),//
    uglify = require('gulp-uglify'),//
    sass = require('gulp-sass'),//
    rename  = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    // rigger = require('gulp-rigger'),
    cssnano      = require('gulp-cssnano'),
    // imagemin = require('gulp-imagemin'),
    // pngquant = require('imagemin-pngquant'),
    // filter       = require('gulp-filter'),
    // bower        = require('gulp-main-bower-files'),
    // dedupe = require('gulp-dedupe'),
    concat = require('gulp-concat'),
    // replace = require('gulp-replace'),
    rimraf = require('gulp-rimraf'),//
    browserSync = require("browser-sync"),
    reload = browserSync.reload;
    // plumber      = require('gulp-plumber');
    // addsrc = require('gulp-add-src'),
    eslint = require('gulp-eslint');//


var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/index.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/styles/main.scss'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/styles/**/*.scss'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "arx!m#d"
};

gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        // .pipe(rigger()) //Прогоним через rigger
        // .pipe(replace('../../bower_components/fontawesome/fonts', '../fonts'))
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
});

gulp.task('js:build', function () {
    gulp.src(['node_modules/jquery/dist/jquery.js', path.src.js]) //Найдем наш main файл
        // .pipe(plumber())
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(concat('index.js'))
        .pipe(uglify()) //Сожмем наш js
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('./', {
            sourceMappingURL: function (file) {
                return path.build.js.replace('./', '') + file.relative + '.map';
            }
        }))
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        // .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            // includePaths: ['node_modules/reset-css/sass/_reset.scss'],
            onError: browserSync.notify
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false

        })) 
        .pipe(cssnano()) //Сожмем
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('./', {
            sourceMappingURL: function (file) {
                return path.build.css.replace('./', '') + file.relative + '.map';
            }
        }))
        .pipe(gulp.dest(path.build.css)) //И в build
});

// gulp.task('image:build', function () {
//     gulp.src(path.src.img) //Выберем наши картинки
//         // .pipe(plumber())
//         .pipe(imagemin({ //Сожмем их
//             progressive: true,
//             svgoPlugins: [{removeViewBox: false}],
//             use: [pngquant()],
//             interlaced: true
//         }))
//         .pipe(gulp.dest(path.build.img)) //И бросим в build
// });

// gulp.task('fonts:build', function() {
//     gulp.src(path.src.fonts)
//         .pipe(gulp.dest(path.build.fonts))
// });

// gulp.task('bower:build', function () {
//     var jsFilter    = filter('**/*.js', {restore: true}),
//         cssFilter   = filter(['**/*.css','!../bower_components/slick-carousel/slick/*.css'], {restore: true}),
//         fontsFilter = filter('**/*.{ttf,woff,eof,svg,woff2}', {restore: true}),
//         imgFilter   = filter('**/*.{jpg,png,gif}', {restore: true});

//     return gulp.src('./bower.json')
//         .pipe(bower())
//         .pipe(jsFilter)

//         .pipe(sourcemaps.init())
//         .pipe(dedupe())
//         .pipe(addsrc.append('src/js/vendor/*.js'))
//         .pipe(concat('vendor.min.js'))
//         .pipe(uglify())
//         .pipe(sourcemaps.write())
//         .pipe(gulp.dest(path.build.js))
//         .pipe(jsFilter.restore)
//         .pipe(cssFilter)
//         .pipe(sourcemaps.init())
//         .pipe(dedupe())
//         .pipe(concat('vendor.min.css'))
//         .pipe(cssnano())
//         .pipe(sourcemaps.write())
//         .pipe(gulp.dest(path.build.css))
//         .pipe(cssFilter.restore)
//         .pipe(fontsFilter)
//         .pipe(gulp.dest(path.build.fonts))
//         .pipe(fontsFilter.restore)
//         .pipe(imgFilter)
//         .pipe(gulp.dest(path.build.img));
// });


gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    // 'fonts:build',
    // 'image:build'
    // 'bower:build'
]);
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
});
gulp.task('clean', function (cb) {
    rimraf('./build', cb);
});
gulp.task('default', ['build','webserver','watch']);