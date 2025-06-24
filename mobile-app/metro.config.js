const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Override the entry point
config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = config; 