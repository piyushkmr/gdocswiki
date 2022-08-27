// shared config (dev and prod)
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const aliasDirs = ['components', 'utils', 'ccl'];
const aliases = {};
aliasDirs.forEach((aliasDir) => {
  aliases[aliasDir] = resolve(__dirname, '../../src/' + aliasDir);
})
module.exports = {
  entry: './index.tsx',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: aliases,
  },
  context: resolve(__dirname, '../../src'),
  module: {
    rules: [
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(scss|sass)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]',
          'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
        ],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: 'index.html.ejs' })],
};
