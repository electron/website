import { Plugin } from '@docusaurus/types';

import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

module.exports = async function pngQuantPlugin() {
  const plugin: Plugin<string> = {
    name: 'png-quant-plugin',
    configureWebpack() {
      return {
        optimization: {
          minimizer: [
            new ImageMinimizerPlugin({
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: ['imagemin-pngquant'],
                },
              },
              loader: false,
            }),
          ],
        },
      };
    },
  };

  return plugin;
};
