module.exports = {
  loader: 'postcss-loader',
  plugins: [
    require('cssnano')({
      preset: 'default',
    }),
    require('postcss-preset-env')(),
  ],
};
