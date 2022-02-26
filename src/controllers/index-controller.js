
class IndexController {

  constructor(app) {
    app.get('/', (async (request, response, next) => {
      response.sendFile(path.join(__dirname, '/resources/index.html'));
    }));
  }

}

module.exports = {
  IndexController
};
