## forge.config.ts
```ts
// forge.config.ts import type{ForgeConfig}from '@electron-forge/shared-types';import{MakerDMG}from '@electron-forge/maker-dmg';import{WebpackPlugin}from '@electron-forge/plugin-webpack';import{mainConfig}from './webpack.main.config';import{rendererConfig}from './webpack.renderer.config';const config: ForgeConfig ={packagerConfig:{name: 'PayPal Inspector',icon: './assets/PayPalInspector'},makers:[{name: '@electron-forge/maker-dmg',config:{background: './assets/background.png',format: 'ULFO'}}],plugins:[new WebpackPlugin({mainConfig,renderer:{config: rendererConfig,entryPoints:[{html: './src/renderer/index.html',js: './src/renderer/index.ts',name: 'main_window',preload:{js: './src/preload/index.ts'}}]}})]};export default config;// // forge.config.ts // import type{ForgeConfig}from '@electron-forge/shared-types';// import{MakerSquirrel}from '@electron-forge/maker-squirrel';// import{MakerZIP}from '@electron-forge/maker-zip';// import{MakerDeb}from '@electron-forge/maker-deb';// import{WebpackPlugin}from '@electron-forge/plugin-webpack';// import{mainConfig}from './webpack.main.config';// import{rendererConfig}from './webpack.renderer.config';// const config: ForgeConfig ={// packagerConfig:{// asar: true,// name: 'WebMonitorBrowser',// executableName: 'webmonitorbrowser' //},// rebuildConfig:{},// makers:[// new MakerSquirrel({// name: 'WebMonitorBrowser' //}),// new MakerZIP({}),// new MakerDeb({// options:{// maintainer: 'Your Name',// homepage: 'https://your-website.com' //}//})//],// plugins:[// new WebpackPlugin({// mainConfig,// renderer:{// config: rendererConfig,// entryPoints:[//{// html: './src/renderer/index.html',// js: './src/renderer/index.ts',// name: 'main_window',// preload:{// js: './src/preload/index.ts' //}//},//{// name: 'monitoring',// preload:{// js: './src/preload/monitoring-bridge.ts' //}//}//]//}//})//]//};// export default config;
```

## tsconfig.json
```json
{"compilerOptions":{"target": "ES6","module": "commonjs","lib":["dom","ES6"],"declaration": true,"declarationMap": true,"sourceMap": true,"outDir": "./dist","rootDir": "./src","strict": true,"moduleResolution": "node","esModuleInterop": true,"allowSyntheticDefaultImports": true,"resolveJsonModule": true,"allowJs": true,"baseUrl": ".","paths":{"*":["node_modules/*"],"@/*":["src/*"]},"typeRoots":["node_modules/@types","./src/global.d.ts"]},"include":["src/**/*"],"exclude":["node_modules","dist",".webpack"]}
```

## webpack.rules.ts
```ts
import type{ModuleOptions}from 'webpack';export const rules: Required<ModuleOptions>['rules']=[// Add support for native node modules{// We're specifying native_modules in the test because the asset relocator loader generates a // "fake" .node file which is really a cjs file. test: /native_modules[/\\].+\.node$/,use: 'node-loader',},{test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,parser:{amd: false},use:{loader: '@vercel/webpack-asset-relocator-loader',options:{outputAssetBase: 'native_modules',},},},{test: /\.tsx?$/,exclude: /(node_modules|\.webpack)/,use:{loader: 'ts-loader',options:{transpileOnly: true,},},},];
```

## webpack.renderer.config.ts
```ts
// webpack.renderer.config.ts import type{Configuration}from 'webpack';import{rules}from './webpack.rules';import{plugins}from './webpack.plugins';import{resolve}from 'path';export const rendererConfig: Configuration ={module:{rules:[...rules,{test: /\.css$/,use:['style-loader',{loader: 'css-loader',options:{importLoaders: 1,modules: false // Set to true if you want CSS modules}}]}]},plugins,resolve:{extensions:['.js','.ts','.jsx','.tsx','.css'],alias:{'@': resolve(__dirname,'src')}}};
```

## webpack.preload.config.ts
```ts
// webpack.preload.config.ts import type{Configuration}from 'webpack';import{rules}from './webpack.rules';import{plugins}from './webpack.plugins';import{resolve}from 'path';export const preloadConfig: Configuration ={target: 'electron-preload',entry:{index: './src/preload/index.ts','monitoring-bridge': './src/preload/monitoring-bridge.ts'},output:{path: resolve(__dirname,'.webpack/preload'),filename: 'index.js'},module:{rules},plugins,resolve:{extensions:['.js','.ts','.jsx','.tsx','.json'],alias:{'@': resolve(__dirname,'src')}}};
```

## webpack.plugins.ts
```ts
// webpack.plugins.ts import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';export const plugins =[new ForkTsCheckerWebpackPlugin({logger: 'webpack-infrastructure',})];
```

## webpack.main.config.ts
```ts
// webpack.main.config.ts import type{Configuration}from 'webpack';import{rules}from './webpack.rules';import{plugins}from './webpack.plugins';import{resolve}from 'path';export const mainConfig: Configuration ={entry: './src/main/index.ts',target: 'electron-main',output:{path: resolve(__dirname,'.webpack/main'),filename: 'index.js'},module:{rules},plugins,resolve:{extensions:['.js','.ts','.jsx','.tsx','.css','.json'],alias:{'@': resolve(__dirname,'src')}}};
```