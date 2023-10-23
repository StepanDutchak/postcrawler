const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const uploadController = require("../controllers/upload.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/user/update-user",
    [authJwt.verifyToken],
    controller.updateUser
  );

  app.post(
    "/api/user/reset-password",
    [authJwt.verifyToken],
    controller.resetPassword
  );

  app.post( "/api/user/get-information",  controller.getInformation)

  app.post(
    "/api/user/check-username",
    controller.checkUsername
  );

  app.get("/api/user/logout", [authJwt.verifyToken], controller.logout);
  app.get("/api/get-my-user", [authJwt.verifyToken], controller.getMyUser);
  app.post("/api/user/get-user", [authJwt.verifyToken], controller.getUser);

  app.post(
    "/api/user/subscribe-user",
    [authJwt.verifyToken],
    controller.subscribeUser
  );
  app.post(
    "/api/user/unsubscribe-user",
    [authJwt.verifyToken],
    controller.unsubscribeUser
  );
  app.post(
    "/api/user/delete-user-image",
    [authJwt.verifyToken],
    controller.deleteImageUser
  );

  app.post(
    "/api/user/get-user-followers-and-followings",
    [authJwt.verifyToken],
    controller.getFollowersAndFollowings
  );
};
