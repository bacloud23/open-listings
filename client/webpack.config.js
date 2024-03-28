import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import Dotenv from 'dotenv-webpack'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()
const paths = {
    public: path.resolve(__dirname, '..', 'public', 'javascripts'),
    cssImages: path.resolve(__dirname, '..', 'public', 'stylesheets', 'images'),
}

export const isDevEnv = 'development' === process.env.NODE_ENV
console.log(process.env.NODE_ENV)
/** @type {import('webpack').WebpackPluginInstance} */
const dotEnvPlugin = new Dotenv()

/**
 * @type {import('webpack').Configuration}
 */
const config = {
    entry: {
        index: './src/views/main/index.js',
        listing: './src/views/listings/listing.js',
        biglists: './src/views/biglistings/biglists.js',
        tags: './src/views/tags/tags.js',
        easteregg: './src/views/easteregg/easteregg.js',
        admin: './src/views/admin/dashboard.js',
    },
    output: {
        filename: '[name]/[name].js',
        path: paths.public,
    },
    ...(isDevEnv ? { mode: 'development', devtool: 'source-map' } : { mode: 'none' }),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [],
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                type: 'asset/resource',
                generator: {
                    filename: '../stylesheets/[name].css',
                },
                use: ['sass-loader'],
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                        },
                    },
                ],
            },
        ],
    },

    plugins: [dotEnvPlugin],
    node: {
        __dirname: true,
    },
}

export default config
