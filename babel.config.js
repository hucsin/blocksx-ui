/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-07-06 20:49:01
 * @Copyright: hucsin.com
 */ 
module.exports = function(api) {
    // Cache the returned value forever and don't call this function again.
    if (api) api.cache(true);
  
    return {
      "comments": false,
      'presets': [
        '@babel/preset-flow',
        '@babel/preset-typescript',
        ['@babel/preset-env', {
          'loose': true,
          "targets": {
            "chrome": "58",
            "ie": "11"
          }
        }],
        ['@babel/preset-react', {
          'pragma': 'createElement'
        }]
      ],
      'plugins': [
         '@babel/plugin-proposal-export-default-from',
        ['@babel/plugin-proposal-decorators', { 'legacy': true }],
        ['@babel/plugin-proposal-class-properties', { 'loose': false }],
        //'babel-plugin-transform-jsx-stylesheet',
        '@babel/plugin-syntax-dynamic-import',
        'transform-react-jsx',
        'babel-plugin-inline-react-svg'
      ],
      'ignore': [
        'src/generator/templates',
        '__mockc__',
        'dist'
      ],
    };
  };