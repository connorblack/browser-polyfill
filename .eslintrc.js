// https://docs.expo.dev/guides/using-eslint/
/** @type {import('@babel/core').TransformOptions} */
module.exports = {
  extends: 'expo',
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'no-unused-vars': 'off', // Turn off the base rule as it can report incorrect errors
  },
}
