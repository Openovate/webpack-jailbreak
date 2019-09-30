const fs = require('fs');
const { resolve, join } = require('path');

const webpack = require('webpack');

const JailbreakPlugin = require('../src');
const config = require('./webpack.config');

test('Basic test', (next) => {
  config.entry = {
    env2: './test/env-2/src/index.js'
  };

  config.plugins = [
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    new JailbreakPlugin({
      folders: {
        'test/env-2/src/module/product': resolve(__dirname, 'env-2/module/product')
      },
      files: {
        'test/env-2/src/assets/number-one.js': 'module.exports = 1'
      }
    })
  ];

  webpack(config).run(function(err, stats) {
    expect(err).toBe(null);
    const fs = stats.compilation.inputFileSystem;
    const actual = fs.readFileSync(resolve('test/public/env2.bundle.js')).toString();

    expect(actual.indexOf('./node_modules/react/index.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/another.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/assets/number-one.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/index.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/category/components/CategoryItem.jsx') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/category/components/CategoryList.jsx') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/category/components/index.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/category/index.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/product.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/product/components.js') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/product/components/ProductItem.jsx') !== -1).toBe(true)
    expect(actual.indexOf('./test/env-2/src/module/product/components/ProductList.jsx') !== -1).toBe(true)

    next();
  });
});

test('Code splitting test', (next) => {
  const components = {
    Link: resolve(__dirname, 'env-3/components/Link.jsx')
  };

  const pages = {
    '/home': {
      route: '/',
      view: resolve(__dirname, 'env-3/pages/home.jsx')
    },
    '/product/page/deep': {
      route: '/product/:id',
      view: resolve(__dirname, 'env-3/pages/product.jsx')
    }
  };

  const context = './test/env-3/client';
  const modules = {};

  //generate a routes file
  (() => {
    const routes = {};
    Object.keys(pages).forEach(path => {
      //determine the target file path (virtual pathing)
      const target = './' + join(context, 'pages', path + '.jsx');
      //add the target/view to the virtual modules
      modules[target] = fs.readFileSync(pages[path].view);
      //add route/view to the browser route
      routes[pages[path].route] = path;
    });

    const target = 'node_modules/foo_module/routes.js';
    const source = 'module.exports = ' + JSON.stringify(routes, null, 2);
    modules[target] = source;
  })();

  //generate a components file
  (() => {
    const target = 'node_modules/foo_module/components.js';
    const source = [];
    const names = Object.keys(components);
    names.forEach(name => {
      const target = 'node_modules/foo_module/components/' + name + '.jsx';
      modules[target] = fs.readFileSync(components[name]);
      source.push(`import ${name} from './components/${name}.jsx';`);
    });

    source.push(`export { ${names.join(', ')} };`);
    modules[target] = source.join("\n");
  })();

  config.entry = { env3: './test/env-3/client/index.js' };
  config.plugins = [
    new JailbreakPlugin({ files: modules })
  ];

  webpack(config).run(function(err, stats) {
    expect(err).toBe(null);
    const fs = stats.compilation.inputFileSystem;
    const actual = fs.readFileSync(resolve('test/public/env3.bundle.js')).toString();

    expect(actual.indexOf('./node_modules/foo_module/routes.js') !== -1).toBe(true);
    expect(actual.indexOf('./node_modules/foo_module/components.js') !== -1).toBe(true);
    expect(actual.indexOf('./node_modules/foo_module/components/Link.jsx') !== -1).toBe(true);
    expect(actual.indexOf('./test/env-3/client/index.js') !== -1).toBe(true);

    const actual0 = fs.readFileSync(resolve('test/public/0.bundle.js')).toString();
    expect(actual0.indexOf('./test/env-3/client/pages/home.jsx') !== -1).toBe(true);

    const actual1 = fs.readFileSync(resolve('test/public/1.bundle.js')).toString();
    expect(actual1.indexOf('./test/env-3/client/pages/product/page/deep.jsx') !== -1).toBe(true);

    next();
  });
})
