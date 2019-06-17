const webpack = require('webpack');
const rxPaths = require('rxjs/_esm5/path-mapping');
const { IndexHtmlWebpackPlugin } = require('@angular-devkit/build-angular/src/angular-cli-files/plugins/index-html-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { AngularCompilerPlugin } = require('@ngtools/webpack');

const helpers = require('./helpers');

module.exports = {

    node: false,

    mode: "development",

    devtool: 'source-map',

    entry: {
        'polyfills': './demo/polyfills.ts',
        'vendor': './demo/vendor.ts',
        'app': './demo/main.ts'
    },

    resolve: {
        extensions: [ '.ts', '.js' ],
        alias: rxPaths()
    },

    output: {
        path: helpers.root('demo/dist'),
        filename: '[name].js',
    },

    performance: {
        hints: false
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [ /\.(spec|e2e)\.ts$/ ],
                loader: '@ngtools/webpack'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|svg|jpe?g|gif|woff|woff2|eot|ttf|ico)$/,
                loader: 'url-loader',
                options: {
                    name: 'asset/[name].[hash].[ext]',
                    limit: 8192
                }
            },
            {
                test: /\.(css|less)$/,
                include: [ helpers.root('demo') ],
                use: [
                    'to-string-loader',
                    'css-loader',
                    'postcss-loader',
                    'less-loader'
                ]
            },
            {
                test: /(?<!component)\.less$/,
                exclude: [ helpers.root('demo') ],
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'less-loader',
                ]
            },
            {
                test: /(?<!component)\.css$/,
                exclude: [ helpers.root('demo') ],
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.component\.(css|less)$/,
                exclude: [ helpers.root('demo') ],
                use: [
                    'to-string-loader',
                    'css-loader',
                    'postcss-loader',
                    'less-loader'
                ]
            },
            {
                test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
                parser: { system: true },
            }
        ]
    },

    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                default: false,
                vendors: false,
                common: {
                    name: 'common',
                    chunks: 'all',
                    minChunks: 2,
                    enforce: true
                }
            }
        }
    },

    plugins: [
        new IndexHtmlWebpackPlugin({
            input: './demo/index.html',
            output: 'index.html',
            entrypoints: [
                'polyfills',
                'vendor',
                'app'
            ]
        }),
        new ProgressPlugin(),
        new MiniCssExtractPlugin({ filename: '[name].[hash].css' }),
        new CircularDependencyPlugin({ exclude: /node_modules/ }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new AngularCompilerPlugin({
            mainPath: 'main.ts',
            tsConfigPath: './demo/tsconfig.demo.json',
            sourceMap: true,
            nameLazyFiles: true,
            skipCodeGeneration: true
        })
    ],

    devServer: {
        historyApiFallback: true,
        watchOptions: {
            ignored: [
                'node_modules',
                '**/*.spec.ts'
            ]
        }
    }
};

