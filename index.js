;(function(log, err, exit, undefined) {

  /**
   * On récupère le fichier package.json
   * On stock l'objet dans une variable `appPackage`
   */
  try {
    var appPackage = require(__dirname + '/package.json');
  } catch (e) {
    // Il se passe quelque chose.. Peut être un problème de permission
    // ou alors il vous manque le fichier package.json (ou celui-ci est malformaté)
    err(e);
    exit();
  }

  /**
   * On parcourt la liste des dépendences nécessaires au
   * bon fonctionnement de l'application et on tente de
   * les récupérer via un `require`.
   * Celles si sont alors stockées en global de sorte à
   * ce que la première lettre de la dépendence soit en majuscule
   * et que si le nom du module contient des caractères non-alpha
   * ceux si sont supprimés.
   */
  try {
    for (var dependency in appPackage.dependencies) {
      global[(dependency[0].toUpperCase() + dependency.substr(1).toLowerCase()).replace(/[\W\d\s_-]+/g, '')] = 
        require(dependency);
    }
  } catch (e) {
    // Il s'est passé quelque chose, peut être un problème de permission
    // ou alors vous avez oublié de faire un `npm install`
    err(e);
    exit();
  }

  // Récupération de notre fichier comprenant les méthodes statiques utiles
  var Utils = require('./utils.js');

  // Création de notre instance mongoose
  Mongoose.connect(Config.get('mongodb.uri'), Config.get('mongodb.options'));

  global['Models'] = {};

  Utils.getFiles('models').forEach(function(modelFile) {
    log("Ajout d'un nouveau model %s", modelFile);

    var modelInterface = require(modelFile);
    var schema = Mongoose.Schema(modelInterface.schema);

    if (modelInterface.statics) {
      for (var modelStatic in modelInterface.statics) {
        schema.statics[modelStatic] = modelInterface.statics[modelStatic];
      }
    }

    if (modelInterface.methods) {
      for (var modelMethod in modelInterface.methods) {
        schema.statics[modelMethod] = modelInterface.methods[modelMethod];
      }
    }

    Models[modelInterface.name] = Mongoose.model(modelInterface.name, schema);
  });


  // On instancie le serveur
  var server = new Hapi.Server();

  // On configure HapiJS depuis la configuration définie dans les fichiers de configuration
  // Par défaut, le fichier de configuration défini sera:
  // ./config/default.json
  // Lorsque vous mettrez en production votre projet, il se peut que vous ayez besoin de
  // définir des variables de développement différentes (accès à la base de données, port, etc...)
  // Dans ce cas, il vous faudra définir la variable d'environnement NODE_ENV à production.json
  // Votre fichier ./config/production.json contiendra quant à lui les variables de configuration
  // qui viendront surcharger celles de votre fichier ./config/default.json
  server.connection(Config.get('server.connection'));

  Utils.getFiles('routes').forEach(function(routesFile) {
    log("Ajout des routes du fichier %s", routesFile);

    require(routesFile).forEach(function(route) {
      log(" +  %s %s", route.method, route.path);
      server.route(route);
    });
  });

  // On demande à HapiJS de lancer le serveur
  server.start(function() {
    // Lorsque le serveur est lancé, on affiche un petit message
    log('%s %s est lancé sur %s', appPackage.name, appPackage.version, server.info.uri);
  });

})(console.log, console.error, process.exit);
