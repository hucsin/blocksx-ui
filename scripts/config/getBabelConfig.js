/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-07-06 20:50:57
 * @Copyright: hucsin.com
 */ 
const babelMerge = require('babel-merge');

const babelConfig = require('../../babel.config')();

module.exports = function(ignoreModule) {
  const envOpt = {
    loose: false,
  };

  if (ignoreModule) {
    envOpt.modules = false;
  }

  return babelMerge(babelConfig, {
    presets: [
      ['@babel/preset-env', envOpt],
    ],
  });
};