# Webpack Jailbreak Plugin

Break out of Webpack's filesystem! This allows you to plugin virtual files and
folders easily.

## Installation

> Note: this has only been tested for Webpack 4 *(though it should work for Webpack 3)*

```bash
npm i @openovate/webpack-jailbreak --save-dev
```

## Usage

The following example makes a virtual file denoted by `some/virtual/path.js` as
well as a virtual directory denoted by `some/virtual/path/in/entry/folder`
which is based on an actual directory denoted by `actual/location/of/path`.

```js
//# FILE: webpack.config.json
const JailbreakPlugin = require('@openovate/webpack-jailbreak');

module.exports = {
  ...
  plugins: [
    new JailbreakPlugin({
      files: {
        'some/virtual/path.js': 'console.log("Hello World")';
      },
      folders: {
        'some/virtual/path/in/entry/folder': path.resolve(__dirname, 'actual/location/of/path')
      }
    })
  ]
  ...
};
```

You can now use your virtual directories relatively anywhere.

```js
const path = require('./some/virtual/path');
const foo = require('./some/virtual/path/in/entry/folder/foo');
```

## Example

For this example we will be using `require` instead of `import` though the
`import` equivalent should work.

 * (1) In your project root folder denoted as `[PROJECT_ROOT]` create a file called
 `[PROJECT_ROOT]/src/index.js` with the following contents.

```js
const { name } = require('./product')
console.log(name)
```

 * (2) Create a file called `[PROJECT_ROOT]/product/index.js` with the following contents.

```js
module.exports = { name: 'iPhone' }
```

> Notice that `[PROJECT_ROOT]/product/index.js` is not in the `[PROJECT_ROOT]/src/`.

 * (3) Create a file called `[PROJECT_ROOT]/webpack.config.js` with the following contents.

```js
const path = require('path');
const JailbreakPlugin = require('@openovate/webpack-jailbreak');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  plugins: [
    new JailbreakPlugin({
      folders: {
        'src/product': path.resolve(__dirname, '/product')
      }
    })
  ]
};
```

 * (4) Run the following commands in terminal

```bash
$ npm init -y
$ npm i webpack webpack-cli @openovate/webpack-JailbreakPlugin --save-dev
$ npx webpack --config webpack.config.js
```

## Why

Webpack assumes that all of your project files should either be located in `node_modules`
or relative to the `entry` directory. To include directories into the entry directory,
webpack suggests to use [symlinks](https://webpack.js.org/configuration/resolve/#resolvesymlinks).
This is a programatic way to bundle external directories without symlinking.

## Inspiration

This project is inspired by [webpack-virtual-modules](https://github.com/sysgears/webpack-virtual-modules/issues)
*(and also extends it)*.
