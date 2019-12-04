const webpackMerge = require('webpack-merge');
const { AngularCompilerPlugin } = require('@ngtools/webpack');

const commonConfig = require('./webpack.common.js');

module.exports = webpackMerge(commonConfig, {

    mode: "development",

    devtool: 'eval-map',

    output: {
        filename: '[name].js',
    },

    plugins: [
        new AngularCompilerPlugin({
            mainPath: 'main.ts',
            tsConfigPath: 'tsconfig-demo.json',
            sourceMap: true,
            nameLazyFiles: true,
            skipCodeGeneration: true
        })
    ],

    devServer: {
        historyApiFallback: true,
        host: 'localhost',
        watchOptions: {
            ignored: [
                'node_modules',
                '**/*.spec.ts'
            ]
        }
    }
});
