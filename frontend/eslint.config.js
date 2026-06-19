export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Prop types not required for this project
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
];