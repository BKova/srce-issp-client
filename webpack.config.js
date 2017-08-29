module.exports = {
  entry: './example.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      request$: 'browser-request',
    },
  },
};
