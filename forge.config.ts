// forge.config.ts
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'PayPal Inspector',
    icon: './assets/PayPalInspector'
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        background: './assets/background.png',
        format: 'ULFO'
      }
    }
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/index.ts',
            name: 'main_window',
            preload: {
              js: './src/preload/index.ts'
            }
          }
        ]
      }
    })
  ]
};

export default config;

// // forge.config.ts
// import type { ForgeConfig } from '@electron-forge/shared-types';
// import { MakerSquirrel } from '@electron-forge/maker-squirrel';
// import { MakerZIP } from '@electron-forge/maker-zip';
// import { MakerDeb } from '@electron-forge/maker-deb';
// import { WebpackPlugin } from '@electron-forge/plugin-webpack';

// import { mainConfig } from './webpack.main.config';
// import { rendererConfig } from './webpack.renderer.config';

// const config: ForgeConfig = {
//   packagerConfig: {
//     asar: true,
//     name: 'WebMonitorBrowser',
//     executableName: 'webmonitorbrowser'
//   },
//   rebuildConfig: {},
//   makers: [
//     new MakerSquirrel({
//       name: 'WebMonitorBrowser'
//     }),
//     new MakerZIP({}),
//     new MakerDeb({
//       options: {
//         maintainer: 'Your Name',
//         homepage: 'https://your-website.com'
//       }
//     })
//   ],
//   plugins: [
//     new WebpackPlugin({
//       mainConfig,
//       renderer: {
//         config: rendererConfig,
//         entryPoints: [
//           {
//             html: './src/renderer/index.html',
//             js: './src/renderer/index.ts',
//             name: 'main_window',
//             preload: {
//               js: './src/preload/index.ts'
//             }
//           },
//           {
//             name: 'monitoring',
//             preload: {
//               js: './src/preload/monitoring-bridge.ts'
//             }
//           }
//         ]
//       }
//     })
//   ]
// };

// export default config;