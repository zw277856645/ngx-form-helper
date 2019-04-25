const ExtractTextPlugin = require('extract-text-webpack-plugin');
const helpers = require('./helpers');

module.exports = {

    entry: {
        "ngx-form-helper": [
            "./node_modules/animate.css/animate.css",
            "./src/form-helper.less",
            "./src/submit-handler/submit-handler-loader.less",
            "./src/error-handler/error-handler-tooltip.less",
            "./src/error-handler/error-handler-text.less"
        ]
    },

    output: {
        path: helpers.root('dist'),
        filename: "[name].js"
    },

    module: {
        loaders: [
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: "file-loader?name=asset/[name].[ext]"
            },
            {
                test: /\.(css|less)$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    loader: 'css-loader?sourceMap!postcss-loader!less-loader'
                })
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('[name].css')
    ]
};

