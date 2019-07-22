const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { SuppressExtractedTextChunksWebpackPlugin } = require('@angular-devkit/build-angular/src/angular-cli-files/plugins/suppress-entry-chunks-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

const helpers = require('./helpers');

module.exports = {

    mode: 'production',

    entry: {
        'ngx-form-helper': [
            './src/form-helper.less',
            './src/submit-handler/submit-handler-loader.less',
            './src/error-handler/simple/error-handler-simple.less'
        ]
    },

    output: {
        path: helpers.root('dist'),
        filename: "[name].js"
    },

    module: {
        rules: [
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
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'less-loader',
                ]
            }
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        new SuppressExtractedTextChunksWebpackPlugin(),
        new CopyWebpackPlugin([
            { from: 'README.md' }
        ])
    ]
};

