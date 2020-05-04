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
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                getLocalIdent: (context, localIdentName, localName, options) => {
                                    let prefix = "da-flex-";
                                    let ignorePrefixKey = "_ignore-";
                                    if ((prefix.slice(0, -1) === localName)) prefix = "";
                                    if ((localName.includes(ignorePrefixKey))) {
                                        prefix = "";
                                        localName = localName.replace(ignorePrefixKey, "");
                                    }
                                    return `${prefix}${localName}`;
                                },
                            },
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                require('autoprefixer'),
                                require('postcss-preset-env'),
                                require('postcss-initial'),
                                require('postcss-flexbugs-fixes'),
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
