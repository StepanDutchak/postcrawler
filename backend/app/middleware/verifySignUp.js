const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const strings = require("../strings");
const Sequelize = require("sequelize");

checkDuplicateEmail = (req, res, next) => {
  // Username
  // User.findOne({
  //   where: {
  //     username: req.body.username
  //   }
  // }).then(user => {
  //   if (user) {
  //     res.status(400).send({
  //       message: "Failed! Username is already in use!"
  //     });
  //     return;
  //   }

  // Email
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        message: "Failed! Email is already in use!",
      });
      return;
    }

    next();
  });
  // });
};

checkDuplicateUsername = (req, res, next) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        username: "Login is already in use!",
      });
      return;
    }

    next();
  });
};

checkValidVerifyEmailCode = (req, res, next) => {
  let lang = req.headers["accept-language"] || 'en';

  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (req.body.activation_token !== user.activation_token) {
        res.status(400).send({
          message: strings[lang].wrong_code,
        });
        return;
      }

      next();
    })
    .catch((error) => {
      res.status(400).send({
        message: strings[lang].user_not_found,
      });
      return;
    });
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  checkValidVerifyEmailCode: checkValidVerifyEmailCode,
  checkDuplicateUsername: checkDuplicateUsername,
};

module.exports = verifySignUp;
