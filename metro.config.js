const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Optimize bundle size
config.transformer.minifierConfig = {
  mangle: true,
  keep_fnames: true,
};

// Better caching for development
config.resetCache = false;

// Optimize resolver for better performance
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = withNativeWind(config, { 
  input: './global.css',
  configPath: './tailwind.config.js'
});
