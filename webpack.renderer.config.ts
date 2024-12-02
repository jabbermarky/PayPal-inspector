// webpack.renderer.config.ts
import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import { resolve } from 'path';

export const rendererConfig: Configuration = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: false // Set to true if you want CSS modules
            }
          }
        ]
      }
    ]
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
};