import fs from "fs";
import path from "path";
import rl from "readline";
// import { crawlPath } from "crawl-path";

export async function getFile(pluginPaths) {
  let files = {
    plugins: {},
    js: []
  };

  if (!Array.isArray(pluginPaths)) {
    crawlPath(pluginPaths, {
      onFile: file => {
        files = filterFile(files, file);
      },
      onDir: (files, _path, depth) => {
        const parentDir = path.dirname(_path);
        const parentFiles = fs.readdirSync(parentDir);

        if (
          !parentFiles.includes(".babelrc") &&
          !files.includes(".babelrc") &&
          depth == 1
        ) {
          copyFile(path.join(__dirname, "../.babelrc"), `${_path}/.babelrc`);
        }
      }
    });
  } else {
    crawlPaths(pluginPaths, {
      onFile: file => {
        files = filterFile(files, file);
      },
      onDir: (files, _path, depth) => {
        const parentDir = path.dirname(_path);
        const parentFiles = fs.readdirSync(parentDir);

        if (
          !parentFiles.includes(".babelrc") &&
          !files.includes(".babelrc") &&
          depth == 1
        ) {
          copyFile(path.join(__dirname, "../.babelrc"), `${_path}/.babelrc`);
        }
      }
    });
  }

  return files;
}

const isJs = /\.js$/;

export function filterFile(files, fileName) {
  if (isJs.test(fileName)) {
    const file = require(fileName).default;
    if (file && file.name) {
      files.plugins[file.name] = file;
    } else {
      files.js.push(file);
    }
  }
  return files;
}

export function copyFile(src, dist) {
  fs.writeFileSync(dist, fs.readFileSync(src));
}

export function crawlPaths(_paths, options = {}) {
  for (let _path of _paths) {
    crawlPath(_path, options);
  }
}

export function crawlPath(_path, options = {}, depth = 0) {
  try {
    if (isDir(_path)) {
      depth += 1;
      const files = fs.readdirSync(_path);
      options.onDir && options.onDir(files, _path, depth);

      if (files) {
        for (let fileName of files) {
          const file = `${_path}/${fileName}`;

          if (isDir(file)) {
            crawlPath(file, options, depth);
          } else if (isFile(file)) {
            options.onFile && options.onFile(file);
          }
        }
      }
    } else if (isFile(_path)) {
      options.onFile && options.onFile(_path);
    }
  } catch (err) {
    console.log(err);
  }
}

export function isDir(_path) {
  return fs.lstatSync(_path).isDirectory();
}

export function isFile(_path) {
  return fs.lstatSync(_path).isFile();
}
