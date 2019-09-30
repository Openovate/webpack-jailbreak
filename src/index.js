const WebpackPlugin = require('./WebpackPlugin');

class JailbreakPlugin extends WebpackPlugin {
  constructor(config = {}) {
    super('JailbreakPlugin', config);
  }
}

module.exports = JailbreakPlugin;
