const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BaseHrefModule = require('base-href-webpack-plugin');

const helpers = require('./helpers');

module.exports = {

    devtool: 'cheap-module-eval-source-map',

    entry: {
        'polyfills': './demo/polyfills.ts',
        'vendor': './demo/vendor.ts',
        'app': './demo/main.ts'
    },

    resolve: {
        extensions: [ '.ts', '.js' ]
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                exclude: [ /\.(spec|e2e)\.ts$/ ],
                loader: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: helpers.root('tsconfig-demo.json')
                        }
                    },
                    'angular2-template-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=asset/[name].[hash].[ext]'
            },
            {
                test: /\.(css|less)$/,
                exclude: [ helpers.root('demo') ],
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    loader: 'css-loader?sourceMap&minimize!postcss-loader!less-loader'
                })
            },
            {
                test: /\.(css|less)$/,
                include: [ helpers.root('demo') ],
                loader: "to-string-loader!css-loader!postcss-loader!less-loader"
            }
        ]
    },

    output: {
        path: helpers.root('demo/dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: [ 'app', 'vendor', 'polyfills' ]
        }),
        new HtmlWebpackPlugin({
            template: './demo/index.html'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(@angular|esm5)/,
            helpers.root('demo'),
            {}
        ),
        new BaseHrefModule.BaseHrefWebpackPlugin({ baseHref: '/' }),
        new ExtractTextPlugin('[name].css')
    ],

    devServer: {
        historyApiFallback: true,
        host: 'cps-local.elenet.me',
        port: 3004,
        watchOptions: {
            ignored: [
                'node_modules',
                '**/*.spec.ts'
            ]
        }
    }
};

