module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    quotes: ["error", "double"],
  },
  // eslint-disable-next-line object-curly-spacing
  parserOptions: { parser: "babel-eslint", ecmaVersion: 8 },
};
