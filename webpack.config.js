const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const LICENSE = fs.readFileSync('LICENSE', 'utf8');

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

module.exports = (env) => {
    const isProduction = env.NODE_ENV === "production";
    return {
        entry: './src/index.js',
        mode: env.NODE_ENV,
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
                                postcssOptions: {
                                    plugins: [
                                        require('autoprefixer'),
                                        require('postcss-preset-env'),
                                        require('postcss-initial'),
                                        require('postcss-flexbugs-fixes')
                                    ]
                                }
                            }
                        }, 'less-loader'
                    ],
                }
            ]
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new CssMinimizerPlugin(),
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: isProduction ? 'index.min.css' : 'index.css'
            }),
            new webpack.BannerPlugin({
                banner: LICENSE
            }),
            new removeFiles(),
        ],
    };
}
