const { nodeModulesPolyfillPlugin } = require('@esbuild-plugins/node-modules-polyfill');
const { NodeGlobalsPolyfillPlugin } = require('@esbuild-plugins/node-globals-polyfill');

module.exports = {
  plugins: [
    nodeModulesPolyfillPlugin(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,  // 适配 buffer 模块
      crypto: true,  // 适配 crypto 模块
      os: true,      // 适配 os 模块
      zlib: true     // 适配 zlib 模块
    })
  ]
};