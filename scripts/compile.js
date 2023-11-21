/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-07-06 20:37:01
 * @Copyright: hucsin.com
 */ 
/**
 * script to build (transpile) files.
 * By default it transpiles all files for all packages and writes them
 * into `lib/` directory.
 * Non-js or files matching IGNORE_PATTERN will be copied without transpiling.
 *
 * Example:
 *  compile all packages: node ./scripts/compile.js
 *  watch compile some packages: node ./scripts/compile.js --watch --packages rax,rax-cli
 */

'use strict';

const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const babel = require('@babel/core');
const chalk = require('chalk');
const glob = require('glob');
const minimatch = require('minimatch');
const tsc = require('node-typescript-compiler');
const parseArgs = require('minimist');
const chokidar = require('chokidar');

const SRC_DIR = 'src';
const JS_FILES_PATTERN = '**/*.(ts|tsx)';
const IGNORE_PATTERN = '**/{__tests__,__mocks__,grammars}/**';

const args = parseArgs(process.argv);
const customPackages = args.packages;

const getBabelConfig = require('./config/getBabelConfig');
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const fixedWidth = str => {
  const WIDTH = 80;
  const strs = str.match(new RegExp(`(.{1,${WIDTH}})`, 'g'));
  let lastString = strs[strs.length - 1];
  if (lastString.length < WIDTH) {
    lastString += Array(WIDTH - lastString.length).join(chalk.dim('.'));
  }
  return strs.slice(0, -1).concat(lastString).join('\n');
};

function buildPackage(packagesDir, dirPath, isBuildEs) {
  const srcDir = path.resolve(packagesDir);
  const pattern = path.resolve(srcDir, '**/*');
  const files = glob.sync(pattern, {nodir: true});
  const esDir = srcDir.indexOf('/eos')> -1 ? 'app' : 'es';
  
  process.stdout.write(
    fixedWidth(`${path.basename(srcDir)}\n`)
  );
  // 如果存在tsconfig.json，直接执行tsconfig
  const tsconfigFile = path.resolve(srcDir, '../../tsconfig.json');
  


  if (fs.existsSync(tsconfigFile)) {
    let fileData =  fs.readFileSync(tsconfigFile, 'utf8');
    let tsconfig =  JSON.parse(fileData);

    if (tsconfig) {
      let outDir = path.resolve(srcDir, '../../',  (isBuildEs ? esDir : 'lib')) ;
      
      tsc.compile(
        {
          ...tsconfig.compilerOptions,
          outDir: outDir,
          declaration: true,
          declarationDir: outDir
        },
        files.filter(it => {
          if (it.match(/(\.ts|\.tsx|\.svg)$/)) {
            return true;
          }
        })
      )
    }
  }

  
  files.forEach(file => buildFile(packagesDir,dirPath, file, isBuildEs, esDir));
  

  process.stdout.write(`[  ${chalk.green('OK')}  ]\n`);
}

function getPackages(packagesDir, customPackages) {
  return fs.readdirSync(packagesDir)
    .map(file => path.resolve(packagesDir, file))
    .filter(f => {
      if (customPackages) {
        const packageName = path.relative(packagesDir, f).split(path.sep)[0];
        return packageName.indexOf(customPackages) !== -1;
      } else {
        return true;
      }
    })
    .filter(f => fs.lstatSync(path.resolve(f)).isDirectory());
}

function buildFile(packagesDir, dirPath, file, isBuildEs, esDir) {
  const BUILD_DIR = isBuildEs ? esDir : 'lib';
  const packageName = path.relative(packagesDir, file).split(path.sep)[0];
  
  const packageSrcPath = path.resolve(packagesDir, packageName, SRC_DIR);
  const packageBuildPath = path.resolve(dirPath, BUILD_DIR, path.relative(packagesDir, file));
  const relativeToSrcPath = packageBuildPath.replace(/(\.js|\.ts|\.tsx)$/, '.js');
  
  const destPath = path.resolve(packageBuildPath, relativeToSrcPath);

  let babelOptions;
  if (isBuildEs) {
    babelOptions = getBabelConfig(true);
  } else {
    babelOptions = getBabelConfig();
  }
  spawnSync('mkdir', ['-p', path.dirname(destPath)]);
  if (!minimatch(file, IGNORE_PATTERN)) {

    //if (!minimatch(file, JS_FILES_PATTERN, { matchBase: true })) {
    if (! file.match(/(\.js|\.ts|\.tsx)$/)){  
      fs.createReadStream(file).pipe(fs.createWriteStream(destPath));
    } else {
      
      const transformed = babel.transformFileSync(file, babelOptions).code;
      spawnSync('mkdir', ['-p', path.dirname(destPath)]);
      fs.writeFileSync(destPath, transformed);
    }
  }
}

// const packagesDir = path.resolve(__dirname, '../packages');
module.exports = function compile(packagesName, packagedir, isBuildEs) {
  const packagesDir = path.resolve(__dirname, `../${packagesName}`);
  const packages = getPackages(packagesDir, customPackages);
  
  if (args.watch) {
    // watch packages
    /*
    const watchPackagesDir = packages.map(dir => path.resolve(dir, SRC_DIR));

    console.log(chalk.green('watch packages compile', packages));

    chokidar.watch(watchPackagesDir, {
      ignored: IGNORE_PATTERN
    }).on('change', (filePath) => {
      const packageName = filePath.match( new RegExp(`\/${packagesName}\/([^\/]*)`))[1];
      const packagePath = path.resolve(__dirname, `../${packagesName}/`, packageName);
      process.stdout.write(chalk.bold.inverse(`Compiling package ${packageName} \n`));
      try {
        buildPackage(packagesDir, packagePath, isBuildEs);
      } catch (e) { console.log(e)}
      process.stdout.write('\n');
    });*/
  } else {
    process.stdout.write(chalk.bold.inverse('Compiling packages\n'));
    buildPackage(packagesDir, packagedir, isBuildEs);
    
    process.stdout.write('\n');
  }
};
