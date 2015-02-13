/**
 * Collection de fonctions utiles
 */

module.exports = {

  /**
   * getFiles(string: path)
   * Retourne une liste de fichiers présents dans `path`
   * @return
   * Tableau de fichiers en chemin absolu
   */
  getFiles: function(path) {
    if (! global['fs']) {
      global['fs'] = require('fs');
    }
    path = path[path.length-1] !== '/' ? path + '/' : path;
    var files = [];
    try {
      files = fs.readdirSync(__dirname + '/' + path);
    } catch (e) {
      err(e);
      process.exit();
    }
    return files.map(function(file) {
      return __dirname + '/' + path + file;
    });
  }

};
