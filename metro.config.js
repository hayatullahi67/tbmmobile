const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for resolving .mjs files used by lucide-react-native
config.resolver.sourceExts.push('mjs');

module.exports = config;
