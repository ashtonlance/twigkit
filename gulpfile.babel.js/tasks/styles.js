/*
 * @title Styles
 * @description A task to compile Sass to CSS.
 */

// Dependencies
import { src, dest, series } from "gulp";
import gulpif from "gulp-if";
import plumber from "gulp-plumber";
import sass from "gulp-sass";
import sassGlob from "gulp-sass-glob";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
// import autoprefixer from "autoprefixer";
import gulpStylelint from "gulp-stylelint";
import errorHandler from "../util/errorHandler.js";
import { isProd } from "../util/env.js";
// import tailwindcss from "tailwindcss";
import { reload } from "../tasks/server";
import browserSync from "browser-sync";

// Config
import { paths } from "../config";

const purgecss = require('@fullhuman/postcss-purgecss')({

  // Specify the paths to all of the template files in your project 
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.twig',
    // etc.
  ],

  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
})

let PostCssPlugins = [
  // non-conditional
  require('tailwindcss')(),
  require('autoprefixer')(), 
  // conditional
  isProd ? purgecss : false
].filter(Boolean);

export function scss() {
  return src(paths.styles.src)
    .pipe(plumber({ errorHandler }))
    .pipe(gulpif(isProd, sourcemaps.init()))
    .pipe(sassGlob())
    .pipe(
      sass({
        includePaths: ["node_modules"],
        outputStyle: "compressed"
      })
    )
    .pipe(postcss(PostCssPlugins))

    .pipe(gulpif(isProd, sourcemaps.write(".")))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

export function stylelint() {
  return src(paths.styles.watch).pipe(
    gulpStylelint({
      failAfterError: isProd,
      reporters: [{ formatter: "string", console: true }],
      syntax: "scss"
    })
  );
}

export const styles = series(scss);
