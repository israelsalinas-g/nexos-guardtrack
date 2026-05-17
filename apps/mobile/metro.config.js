const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo workspace (including packages/shared)
config.watchFolders = [workspaceRoot];

// 2. Map standard singletons to their resolved package paths using Node's resolution algorithm
const singletons = [
  'react',
  'react-dom',
  'react-native',
  'expo',
  '@react-navigation/native',
  '@react-navigation/stack',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-gesture-handler',
  'color-string'
];

config.resolver.extraNodeModules = singletons.reduce((acc, name) => {
  try {
    acc[name] = path.dirname(require.resolve(`${name}/package.json`, { paths: [projectRoot] }));
  } catch (err) {
    // Fallback if package.json cannot be resolved directly
    acc[name] = path.resolve(projectRoot, 'node_modules', name);
  }
  return acc;
}, {});

// 3. Force Metro to resolve modules first from the local app node_modules, then workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 4. Disable standard hierarchical lookup so it doesn't leak into workspace root node_modules unexpectedly
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
