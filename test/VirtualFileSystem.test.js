const fileSystem = require('fs');
const path = require('path');
const VirtualFileSystem = require('../src/VirtualFileSystem');

test('VirtualFileSystem mkdir() test', () => {
  const vfs = new VirtualFileSystem(fileSystem);

  vfs.mkdir('/foo/bar/zoo');
  const folders1 = Object.keys(vfs.folders);
  expect(folders1.indexOf('/foo/bar/zoo') !== -1).toBe(true);
  expect(folders1.indexOf('/foo/bar') !== -1).toBe(true);
  expect(folders1.indexOf('/foo') !== -1).toBe(true);
  expect(folders1.indexOf('/') !== -1).toBe(false);

  vfs.mkdir('/tmp/bar/zoo');
  const folders2 = Object.keys(vfs.folders);
  expect(folders2.indexOf('/tmp/bar/zoo') !== -1).toBe(true);
  expect(folders2.indexOf('/tmp/bar') !== -1).toBe(true);
  expect(folders2.indexOf('/tmp') !== -1).toBe(false);
});

test('VirtualFileSystem writeFile() test', () => {
  const vfs = new VirtualFileSystem(fileSystem);

  vfs.writeFile('/foo/bar/zoo.txt', 'foobar');
  const folders1 = Object.keys(vfs.folders);
  expect(folders1.indexOf('/foo/bar') !== -1).toBe(true);
  expect(folders1.indexOf('/foo') !== -1).toBe(true);
  expect(folders1.indexOf('/') !== -1).toBe(false);
  expect(vfs.folders['/foo/bar'].length).toBe(1);
  expect(vfs.files['/foo/bar/zoo.txt']).toBe('foobar');

  vfs.writeFile('/tmp/bar/zoo.txt', 'foobar');
  const folders2 = Object.keys(vfs.folders);
  expect(folders2.indexOf('/tmp/bar') !== -1).toBe(true);
  expect(folders2.indexOf('/tmp') !== -1).toBe(false);
  expect(vfs.folders['/tmp/bar'].length).toBe(1);
  expect(vfs.files['/tmp/bar/zoo.txt']).toBe('foobar');
});

test('VirtualFileSystem copy() test', () => {
  const vfs = new VirtualFileSystem(fileSystem);

  vfs.copy(path.join(__dirname, 'env-1'), '/foo/bar');
  const folders1 = Object.keys(vfs.folders);
  expect(folders1.indexOf('/foo/bar/import-1') !== -1).toBe(true);
  expect(folders1.indexOf('/foo/bar/import-2') !== -1).toBe(true);
  expect(folders1.indexOf('/foo/bar') !== -1).toBe(true);
  expect(folders1.indexOf('/foo') !== -1).toBe(true);
  expect(folders1.indexOf('/') !== -1).toBe(false);
  expect(vfs.folders['/foo/bar/import-1'].length).toBe(2);
  expect(vfs.folders['/foo/bar/import-2'].length).toBe(2);
  expect(vfs.files['/foo/bar/import-1/import-1.txt'].toString()).toBe("IMPORT 1\n");
  expect(vfs.files['/foo/bar/import-1/import-2.txt'].toString()).toBe("IMPORT 2\n");
  expect(vfs.files['/foo/bar/import-2/import-1.txt'].toString()).toBe("IMPORT 1\n");
  expect(vfs.files['/foo/bar/import-2/import-2.txt'].toString()).toBe("IMPORT 2\n");
});

test('VirtualFileSystem sizeof() test', () => {
  const vfs = new VirtualFileSystem(fileSystem);

  vfs.writeFile('/foo/bar/zoo.txt', 'foobar');
  expect(vfs.sizeof('/foo/bar/zoo.txt')).toBe(6);
  expect(vfs.sizeof('/foo/bar')).toBe(6);
  expect(vfs.sizeof('/foo')).toBe(0);
});

test('VirtualFileSystem statsof() test', () => {
  const vfs = new VirtualFileSystem(fileSystem);

  vfs.writeFile('/foo/bar/zoo.txt', 'foobar');

  const stats1 = vfs.statsof('/foo/bar/zoo.txt');
  expect(stats1.dev).toBe(8675309);
  expect(stats1.mode).toBe(33188);
  expect(stats1.size).toBe(6);

  const stats2 = vfs.statsof('/foo/bar');
  expect(stats2.dev).toBe(16777220);
  expect(stats2.mode).toBe(16877);
  expect(stats2.size).toBe(6);

  const stats3 = vfs.statsof('/na/da');
  expect(stats3.dev).toBe(null);
  expect(stats3.mode).toBe(null);
  expect(stats3.size).toBe(0);
});
