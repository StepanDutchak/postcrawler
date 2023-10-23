const { verifySignUp, verifyResetPassword } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateEmail],
    controller.signUp
  );

  app.post(
    "/api/auth/verification-email",
    [verifySignUp.checkValidVerifyEmailCode],
    controller.verificationEmail
  );

  app.post(
    "/api/auth/signup-continue",
    [verifySignUp.checkDuplicateUsername],
    controller.signUpContinue
  );
  app.post("/api/auth/refreshtoken", controller.refreshToken);
  app.post("/api/auth/resend-code", controller.resendCode);
  app.post("/api/auth/signin", controller.signIn);
  app.post("/api/auth/forgot-password", controller.forgotPassword);
  app.post(
    "/api/auth/verification-forgot-password",
    [verifyResetPassword.checkDuplicateResetPasswordToken],
    controller.verificationForgotPassword
  );
  app.post("/api/auth/reset-password", controller.resetPassword);
};
