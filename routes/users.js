/**
 * Routage /users
 */

var Users = Models['Users'];

module.exports = [

  /**
   * POST /users
   *
   * @description
   * Création d'un nouveau compte d'utilisateur
   *
   * @return
   *   201 (created)
   *   400 (bad request)
   *   409 (conflict)
   *   500 (internal server error)
   */
  {

    method: 'POST',

    path: '/users',

    config: {

      validate: {

        options: {
          // Demande à HapiJS d'attendre la validation complète de toutes les règles
          // de validation avant de retourner une erreur (si erreur il y a)
          // Le comportement par défaut retourne en effet la première erreur survenue,
          // faisant abstraction du reste des règles de validation
          abortEarly: false
        },

        /*payload: {
          email: Joi.string().email().required(),
          password: Joi.string().required().min(5).max(40),
          address: Joi.string().required(),
          zipcode: Joi.string().required(),
          city: Joi.string().required()
        }*/


        payload: function(payload, request, next) {

          var JoiValidationSchema = {
            email: Joi.string().email().required(),
            password: Joi.string().required().min(5).max(40),
            address: Joi.string().required(),
            zipcode: Joi.string().required(),
            city: Joi.string().required()
          };

          var JoiValidation = Joi.validate(payload, JoiValidationSchema, {
            abortEarly: false
          });

          if (JoiValidation.error) {
            return next(Boom.badRequest(JoiValidation.error));
          }

          var checkEmail = Users.findOne({email: payload.email}).exec();
          checkEmail.then(function(user) {
            if (! user) {
              next();
            } else {
              next(Boom.conflict());
            }
          }, function(err) {
            next(Boom.badImplementation())
          });
        }
      }
    },

    handler: function(request, reply) {

      var user = new Users(request.payload);

      user.save(function(err) {
        // Le code d'erreur 11000 signifie que l'adresse email est déjà renseignée
        // Il s'agit d'une erreur MongoDB (pas d'une erreur Mongoose)
        if (err && err.code === 11000) {
          reply().code(409);
        }

        else if (err) {
          reply().code(500);
        }

        else {
          reply().code(201);
        }
      });
    }

  }

];