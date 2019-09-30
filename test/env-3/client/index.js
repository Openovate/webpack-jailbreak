import routes from 'foo_module/routes';
import components from 'foo_module/components';

const resolve = routes['/'];

// use require.context instead of import() because there
// are some quirks when using paths as variables
/*const modules = require.context('./pages', true, /\.((js)|(jsx))$/, 'lazy');

//if the route is part of the file system
if (modules.keys().indexOf(resolve) !== -1) {
  // load the component
  modules(`./pages${resolve}.jsx`).then(this.handleComponent.bind(this, route));
}*/

import(`./pages/${resolve}.jsx`).then((component) => {

});
