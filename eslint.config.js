// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierConfig = require('eslint-config-prettier')

module.exports = defineConfig([
  {
    ignores: [
      'dist/*',
      'src/NEUIKit/chat/**',
      'src/NEUIKit/common/**',
      'src/NEUIKit/contact/**',
      'src/NEUIKit/conversation/**',
      'src/NEUIKit/friend/**',
      'src/NEUIKit/login/**',
      'src/NEUIKit/static/**',
      'src/NEUIKit/team/**',
      'src/NEUIKit/user/**'
    ]
  },
  ...expoConfig,
  prettierConfig,
  {
    plugins: {
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
      prettier: require('eslint-plugin-prettier')
    },
    rules: {
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  }
])
