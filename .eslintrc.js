module.exports = {
  env: {
    node: true,
  },
  extends: 'airbnb-base',
  plugins: [
    'import',
  ],
  rules: {
    'no-console': 'off',
    'prefer-destructuring': 'off',
  },
};
