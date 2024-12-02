// webpack.preload.config.ts
import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import { resolve } from 'path';

export const preloadConfig: Configuration = {
  target: 'electron-preload',
  entry: {
    index: './src/preload/index.ts',
    'monitoring-bridge': './src/preload/monitoring-bridge.ts'
  },
  output: {
    path: resolve(__dirname, '.webpack/preload'),
    filename: 'index.js'
  },
  module: {
    rules
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
};