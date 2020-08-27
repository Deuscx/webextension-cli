module.exports = {
  env: {
    browser: true,
    webextensions: true
  },

  <% if(useFramework) { %>
  extends: ['plugin:vue/essential'],

  <% } %>
  parserOptions: {
    ecmaVersion: 12,
    parser: '@typescript-eslint/parser'
  },
  plugins: ['vue'],
  rules: {}
};
