const crypto = require('crypto');

function hashClassName(className) {
  return crypto.createHash('md5').update(className).digest('hex').substring(0, 6);
}

module.exports = {
  plugins: [
    // 自定义插件：混淆类名
    (root) => {
      root.walkRules(rule => {
        rule.selectors = rule.selectors.map(selector =>
          selector.replace(/\.(\w+)/g, (match, className) => `.${hashClassName(className)}`)
        );
      });
    },
    // 其他 PostCSS 插件
    require('cssnano')({
      preset: 'default',
    }),
  ],
};