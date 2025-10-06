const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  
  Object.assign(fallback, {
    "path": require.resolve("path-browserify"),
    "fs": false,
    "crypto": false,
    "stream": false,
    "assert": false,
    "http": false,
    "https": false,
    "os": false,
    "url": false,
    "zlib": false,
    "buffer": require.resolve("buffer/"),
    "process/browser": require.resolve("process/browser")
  });
  
  config.resolve.fallback = fallback;
  
  // Permite resolver módulos sem extensões completas
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  });
  
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ]);
  
  // Ignora avisos de source maps
  config.ignoreWarnings = [/Failed to parse source map/];
  
  return config;
}
