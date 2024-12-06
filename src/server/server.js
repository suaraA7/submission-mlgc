require("dotenv").config();

const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const { loadModel } = require("../services/loadModel");
const InputError = require("../exceptions/InputError");

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  const model = await loadModel();
  server.app.model = model;

  server.route(routes);

  server.ext("onPreResponse", function (request, h) {
    const response = request.response;
    if (response instanceof InputError) {
      // InputError akan berasal dari file InputError.js
      const newResponse = h.response({
        status: "fail",
        message: `Terjadi kesalahan dalam melakukan prediksi`,
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }
    if (response.isBoom) {
      const statusCode = response.output.statusCode;
      let errorMessage;

      // const newResponse = h.response({
      //     status: 'fail',
      //     message: response.message
      // })
      // newResponse.code(response.statusCode)
      // return newResponse;

      if (statusCode === 413) {
        errorMessage = "Payload content length greater than maximum allowed: 1000000";
      } else {
        errorMessage = response.message || "Terjadi kesalahan";
      }

      const newResponse = h.response({
        status: "fail",
        message: errorMessage,
      });
      newResponse.code(statusCode);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
})();
