const fileSystem = require('fs');
const path = require('path');
const VirtualFileSystem = require('./VirtualFileSystem');

class WebpackPlugin {
  /**
   * Sets up the initial variables
   *
   * @param {String} name
   * @param {Object} [config = {}]
   */
  constructor(name, config = {}) {
    this.name = name;
    this.watcher = false;
    this.virtualFileSystem = new VirtualFileSystem(fileSystem);

    if (config.files) {
      for (const target in config.files) {
        this.virtualFileSystem.writeFile(target, config.files[target]);
      }
    }

    if (config.folders) {
      for (const target in config.folders) {
        this.virtualFileSystem.copy(config.folders[target], target);
      }
    }
  }

  /**
   * Sets up the initial variables
   *
   * @param {Compiler} compiler
   */
  apply(compiler) {
    const copy = function copy() {
      for(const file in this.virtualFileSystem.files) {
        this.writeFile(compiler, file, this.virtualFileSystem.files[file]);
      }

      for(const folder in this.virtualFileSystem.folders) {
        this.mkdir(compiler, folder, Array.from(this.virtualFileSystem.folders[folder]));
      }
    };

    compiler.hooks.afterEnvironment.tap(this.name, () => {
      const self = this;
      const purge = compiler.inputFileSystem.purge;
      compiler.inputFileSystem.purge = function() {
        purge.apply(this, arguments);
        copy.call(self);
      };
    });

    compiler.hooks.afterPlugins.tap(this.name, () => {
      copy.call(this);
    });

    compiler.hooks.watchRun.tapAsync(this.name, (watcher, callback) => {
      this.watcher = watcher.compiler || watcher;
      callback();
    });
  }

  /**
   * Updates a files content in the Virtual File System
   * then writes it to webpacks file system
   *
   * @param {Compiler} compiler
   * @param {String} file
   * @param {(String|Buffer)} content
   */
  updateFile(compiler, file, content) {
    this.virtualFileSystem.writeFile(file, content);
    return this.writeFile(compiler, file, content);
  }

  /**
   * Writes a file to webpack's _readFileStorage
   *
   * @param {Compiler} compiler
   * @param {String} file
   * @param {(String|Buffer)} content
   */
  writeFile(compiler, file, content) {
    const stats = this.virtualFileSystem.statsof(file);
    const statStorage = compiler.inputFileSystem._statStorage;
    const fileStorage = compiler.inputFileSystem._readFileStorage;

    if (!path.isAbsolute(file)) {
      file = path.join(compiler.context, file);
    }

    if (statStorage.data instanceof Map) {
      statStorage.data.set(file, [null, stats]);
    } else {
      statStorage.data[file] = [null, stats];
    }

    if (fileStorage.data instanceof Map) {
      fileStorage.data.set(file, [null, content]);
    } else {
      fileStorage.data[file] = [null, content];
    }

    if (!this.watcher) {
      return;
    }

    const watchers = this.watcher.watchFileSystem.watcher.fileWatchers;
    for (const watcher of watchers) {
      if (watcher.path !== file) {
        continue;
      }

      watcher.emit('change', Date.now(), null);
      break;
    }
  }

  /**
   * Writes a folder to webpack's _readdirStorage
   *
   * @param {Compiler} compiler
   * @param {String} folder
   * @param {Array} files
   */
  mkdir(compiler, folder, files) {
    const stats = this.virtualFileSystem.statsof(folder);
    const statStorage = compiler.inputFileSystem._statStorage;
    const dirStorage = compiler.inputFileSystem._readdirStorage;

    if (!path.isAbsolute(folder)) {
      folder = path.join(compiler.context, folder);
    }

    if (statStorage.data instanceof Map) {
      statStorage.data.set(folder, [null, stats]);
    } else {
      statStorage.data[folder] = [null, stats];
    }

    files = files.map(file => {
      return path.basename(file);
    });

    if (dirStorage.data instanceof Map) {
      dirStorage.data.set(folder, [null, files]);
    } else {
      dirStorage.data[folder] = [null, files];
    }
  }
}

module.exports = WebpackPlugin;
