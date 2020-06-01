module.exports = {
  env: {
    node: true,
  },
  extends: 'airbnb-base',
  plugins: [
    'import',
  ],
  ignorePatterns: [
    '!.eslintrc.js',
  ],
  rules: {
    'no-console': 'off',
    'prefer-destructuring': 'off',
  },
};
