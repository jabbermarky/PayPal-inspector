// webpack.main.config.ts
import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import { resolve } from 'path';

export const mainConfig: Configuration = {
  entry: './src/main/index.ts',
  target: 'electron-main',
  output: {
    path: resolve(__dirname, '.webpack/main'),
    filename: 'index.js'
  },
  module: {
    rules
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
};