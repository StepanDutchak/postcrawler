const db = require("../models");
const PasswordResets = db.password_resets;

checkDuplicateResetPasswordToken = (req, res, next) => {
  PasswordResets.findOne({
    where: {
      email: req.body.email,
    },
  }).then((response) => {
    if(response?.email) {
        PasswordResets.destroy( {where: {email: response.email}});
    }

    next();
  });
};

const verifySignUp = {
  checkDuplicateResetPasswordToken: checkDuplicateResetPasswordToken,
};

module.exports = verifySignUp;
