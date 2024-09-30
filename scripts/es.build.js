const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Function to get all component directories and their subdirectories
const getComponentDirectories = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // If it's a directory, check if it has an index.tsx file
      const indexFile = path.join(filePath, 'index.tsx');
      if (fs.existsSync(indexFile)) {
        results.push(filePath); // Include the full path of the directory
      }
      // Recur for subdirectories
      results = results.concat(getComponentDirectories(filePath));
    }
  });
  
  return results;
};

// Main function to build components
const buildComponents = async () => {
  const componentsDir = './src/components';
  const componentDirs = getComponentDirectories(componentsDir);
    console.log(componentDirs,22)
  const buildPromises = componentDirs.map(async (componentDir) => {
    await esbuild.build({
      entryPoints: [path.join(componentDir)], // Entry point for each component
      bundle: true,
      outdir: path.join('dist', path.relative(componentsDir, componentDir)), // Output directory retains component structure
      format: 'esm',
      platform: 'browser',
      target: ['esnext'],
      sourcemap: true,
      minify: true,
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'jsx',
        '.css': 'css',
        '.scss': 'css', // Treat SCSS as CSS (will compile separately)
        '.svg': 'file',
      },
      external: ['react', 'react-dom'], // Don't bundle these libraries
    });
  });

  await Promise.all(buildPromises); // Wait for all builds to finish
  console.log('Build finished for all components');
};

// Function to compile SCSS to CSS using the `sass` package
const compileSass = async (inputFile, outputFile) => {
  const sass = require('sass');
  const result = sass.renderSync({ file: inputFile });

  fs.writeFileSync(outputFile, result.css, 'utf8');
  console.log(`Compiled ${inputFile} to ${outputFile}`);
};

// Function to compile all SCSS files in component directories
const compileAllSass = async () => {
  const componentsDir = 'src/components';
  const componentDirs = getComponentDirectories(componentsDir);

  for (const componentDir of componentDirs) {
    const scssPath = path.join(componentDir, 'style.scss'); // Assuming a style.scss file
    const cssPath = path.join('dist', path.relative(componentsDir, componentDir), 'style.css'); // Output path for CSS

    if (fs.existsSync(scssPath)) {
      await compileSass(scssPath, cssPath);
    }
  }
};

const runBuild = async () => {
  await buildComponents();
  //await compileAllSass();
};

runBuild().catch(() => process.exit(1));