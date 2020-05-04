const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

//删除没必要的index.js文件
class removeFiles {
    apply(compiler) {
        compiler.hooks.afterEmit.tapPromise('removeFiles', compilation => {
            return new Promise((resolve, reject) => {
                fs.unlink(path.resolve(__dirname, 'dist/index.js'), async () => {
                    resolve();
                });
            });
        });
    }
}

module.exports = {
    entry: './src/index.js',
    mode: "production",
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader, 'css-loader',
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                require('autoprefixer'),
                                require('postcss-preset-env'),
                                require('postcss-initial'),
                            ]
                        }
                    }
                    , 'less-loader'
                ],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'index.min.css'
        }),
        new OptimizeCSSAssetsPlugin({
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
                preset: ['default', {discardComments: {removeAll: false}}],
            },
            canPrint: true,
        }),
        new removeFiles()
    ],
};
