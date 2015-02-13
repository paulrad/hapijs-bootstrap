module.exports = [

  /**
   * GET /
   *
   * @description
   *   Index de l'API
   *
   * @return
   *   200
   */

  {
    method: 'GET',

    path: '/',

    handler: function(request, reply) {
      reply();      
    }
  }
];
