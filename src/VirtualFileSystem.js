const path = require('path');

const VirtualStats = require('./VirtualStats');

class VirtualFileSystem {
  /**
   * Sets up the initial variables
   *
   * @param {FileSystem} fileSystem
   */
  constructor(fileSystem) {
    this.fileSystem = fileSystem;
    this.files = {};
    this.folders = {};
  }

  /**
   * Sets up the initial variables
   *
   * @param {String} source
   * @param {String} target
   * @param {FileSystem} fileSystem
   *
   * @return {VirtualFileSystem}
   */
  copy(source, target, fileSystem) {
    fileSystem = fileSystem || this.fileSystem;

    //if the source is not a folder in the real file system
    if (!fileSystem.existsSync(source)
      || !fileSystem.lstatSync(source).isDirectory()
    ) {
      throw new Error(`Source: ${source} not found`);
    }

    walk(fileSystem, source, (file) => {
      const content = fileSystem.readFileSync(file);
      const destination = path.join(target, file.substr(source.length));
      this.writeFile(destination, content);

      //parse the target for its file meta properties
      const meta = path.parse(destination);

      //we need to see if this is an index file to solve
      //for a VirtualModulesPlugin quirk described below
      const index = meta.dir + '.js';

      //if base name is not index or index exists
      if (meta.name === 'index' && !this.files[index]) {
        //what we are doing here is creating a ./module/name.js for
        // ./module/name/index.js then updating any ./ reference with ./name/

        //this is a rudementary solution, so lets hope it doesnt get more
        //complicated than this.
        const last = meta.dir.split(path.sep).pop();
        this.writeFile(index, content.toString().replace(/\.\//g, './' + last + '/'));
      }
    });

    return this;
  }

  /**
   * Recursively creates virtual folders
   *
   * @param {String} folder
   *
   * @return {String}
   */
  mkdir(folder) {
    //if the folder exists
    if (this.fileSystem.existsSync(folder)) {
      //no need to add
      return folder;
    }

    //if the folder name does not exist
    if (typeof this.folders[folder] === 'undefined') {
      //create one
      this.folders[folder] = [];
    }

    //get the parent
    const dirname = path.dirname(folder);

    //and also try to make a folder
    this.mkdir(dirname);

    //if the dirname exist
    if (typeof this.folders[dirname] !== 'undefined') {
      this.folders[dirname].push(folder);
    }

    return folder;
  }

  /**
   * Returns the size of a file or folder
   *
   * @param {String} item
   * @param {(String|Buffer)} content
   *
   * @return {Integer}
   */
  sizeof(item) {
    let size = 0;
    //if it's a file
    if (typeof this.files[item] !== 'undefined') {
      size = this.files[item].length;
    //if it's a folder
    } else if (typeof this.folders[item] !== 'undefined') {
      this.folders[item].forEach(file => {
        if (typeof this.files[file] !== 'undefined') {
          size += this.files[file].length;
        }
      });
    }

    return size;
  }

  /**
   * Returns the Stats of a file or folder
   *
   * @param {String} item
   *
   * @return {VirtualStats}
   */
  statsof(item) {
    let dev = null, mode = null, size = this.sizeof(item);

    //if it's a file
    if (typeof this.files[item] !== 'undefined') {
      dev = 8675309,
      mode = 33188;
    //if it's a folder
    } else if (typeof this.folders[item] !== 'undefined') {
      dev = 16777220,
      mode = 16877;
    }

    const time = Date.now();
    return new VirtualStats({
      dev: dev,
      nlink: 0,
      uid: 1000,
      gid: 1000,
      rdev: 0,
      blksize: 4096,
      mode: mode,
      size: size,
      blocks: Math.floor(size / 4096),
      atime: time,
      mtime: time,
      ctime: time,
      birthtime: time
    });
  }

  /**
   * Creates a new file given the content
   *
   * @param {String} file
   * @param {(String|Buffer)} content
   *
   * @return {VirtualFileSystem}
   */
  writeFile(file, content) {
    //just add to the file list
    this.files[file] = content;

    const folder = this.mkdir(path.dirname(file));

    //if the folder name exist
    if (this.folders[folder] instanceof Array) {
      //this is the exact same format expected by _addFolder()
      this.folders[folder].push(file);
    }

    return this;
  }
}

module.exports = VirtualFileSystem;

/**
 * Helper to walk through each file
 *
 * @param {FileSystem} fileSystem
 * @param {String} folder
 * @param {Function} callback
 */
function walk(fileSystem, folder, callback) {
  const files = fileSystem.readdirSync(folder);

  for (const file of files) {
    const item = path.join(folder, file);
    if (fileSystem.statSync(item).isDirectory()) {
      walk(fileSystem, item, callback);
    } else {
      callback(item);
    }
  }
}
