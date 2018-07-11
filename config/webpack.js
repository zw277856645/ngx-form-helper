var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');

module.exports = {

    entry: {
        "ngx-form-helper": [
            "./node_modules/animate.css/animate.css",
            "./src/form-helper.less",
            "./src/submit-handler/submit-handler-loader.less",
            "./src/error-handler/error-handler-tooltip.less"
        ]
    },

    output: {
        path: helpers.root('dist'),
        filename: "[name].js"
    },

    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                use: "file-loader?name=asset/[name].[ext]"
            },
            {
                test: /\.(css|less)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader?sourceMap&minimize!postcss-loader!less-loader'
                })
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('[name].css')
    ]
};

