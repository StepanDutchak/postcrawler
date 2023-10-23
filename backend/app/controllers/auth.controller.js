const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const PasswordResets = db.password_resets;
const RefreshToken = db.refreshToken;
const strings = require("../strings");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const crypto = require("crypto");
var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
  name: 'peyon.com.ua',
  host: "mail.peyon.com.ua",
  port: 25,
  secure: false, // use TLS
  auth: {
    user: "peyon@peyon.com.ua",
    pass: "enderstar2750",
  },
  tls: {
    rejectUnauthorized: false
  }
});

var mail = {
  from: "Peyon",
  to: "pro3dwork@gmail.com",
  subject: "Send verify vcode",
  text: "Node.js New world for me",
  html: "<b>Node.js New world for me</b>",
};

exports.signUp = (req, res) => {
  // Save User to Database
  let { email } = req.body;

  let activation_token = (Math.floor(Math.random() * 10000) + 10000)
    .toString()
    .substring(1);

  User.create({
    email: email.toLowerCase().trim(),
    activation_token,
  })
    .then(() => {
      mail.to = email;
      mail.html = `<div id="wrapper" style="
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;">
          <div id="dialog">
              <h3>Вітаємо, ми з Ураїни!</h3>
              <span >Ваш код підтвердження:</span>
              <div>
                  <h1 style="
                  text-align: center;
              ">${activation_token}</h1>
              </div>
          </div>
      </div>`;


      console.log('SEEEEEND\n\n\n');
      smtpTransport.sendMail(mail, function (error, response) {
        if (error) {
          console.log('ERRRRROOOOOOOOOOOORRR\n\n\n', error);
        } else {
          console.log("Message sent: " + response);
        }

        smtpTransport.close();
      });
      res.status(200).send({ message: "Send code your email!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signUpContinue = (req, res) => {
  let { username, password, email, first_name, phone, last_name } = req.body;
  let lang = req.headers["accept-language"] || 'en';

  User.findOne({ where: { email } })
    .then(async (user) => {
      user.password = bcrypt.hashSync(password, 8);
      user.username = username;
      user.first_name = first_name;
      user.last_name = last_name;
   
      user.registration_completed = true;
  

      // if (phone.length) {
        user.phone = phone;
      // }

      user.save()

      var passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: strings[lang].invalid_password,
        });
      }

      let refreshToken = await RefreshToken.createToken(user);

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration,
      });

      res.status(200).send({
        accessToken: token,
        refreshToken: refreshToken,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.verificationEmail = (req, res) => {
  let { email, activation_token } = req.body;

  User.findOne({ where: { email, activation_token } })
    .then((user) => {
      user.email_verified = true;
      user.activation_token = null;
      user.save();
      res.status(200).send({ message: "Verify code successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signIn = (req, res) => {
  let { email, username, password, fcm_token } = req.body;
  let lang = req.headers["accept-language"] || 'en';

  let data;

  if (email && email.length) {
    data = { email };
  } else if (username && username.length) {
    data = { username };
  }

  User.findOne({
    where: data,
  })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ email: strings[lang].user_not_found });
      }
      user.fcm_token = fcm_token;
      user.save()

      var passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          password: strings[lang].invalid_password,
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration,
      });

      let refreshToken = await RefreshToken.createToken(user);

      res.status(200).send({
        accessToken: token,
        refreshToken: refreshToken,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.resendCode = (req, res) => {
  let { email } = req.body;

  User.findOne({
    where: { email },
  })
    .then((user) => {
      mail.to = email;
      mail.html = `<div id="wrapper" style="
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;">
          <div id="dialog">
              <h3>Вітаємо, ми з Ураїни!</h3>
              <span >Ваш код підтвердження:</span>
              <div>
                  <h1 style="
                  text-align: center;
              ">${activation_token}</h1>
              </div>
          </div>
      </div>`;

      smtpTransport.sendMail(mail, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + response.message);
        }

        smtpTransport.close();
      });
      res.status(200).send({ message: "Send code your email!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({
      where: { token: requestToken },
    });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    const user = await refreshToken.getUser();
    let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.forgotPassword = (req, res) => {
  let { email } = req.body;
  let lang = req.headers["accept-language"] || 'en';

  let activation_token = (Math.floor(Math.random() * 10000) + 10000)
    .toString()
    .substring(1);

  User.findOne({ where: { email } })
    .then((user) => {
      user.activation_token = activation_token;
      user.save();

      mail.to = email;
      mail.html = `<div id="wrapper" style="
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;">
          <div id="dialog">
              <h3>Вітаємо, ми з Ураїни!</h3>
              <span >Ваш код підтвердження:</span>
              <div>
                  <h1 style="
                  text-align: center;
              ">${activation_token}</h1>
              </div>
          </div>
      </div>`;

      smtpTransport.sendMail(mail, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + response.message);
        }

        smtpTransport.close();
      });
      res.status(200).send({ message: "Send code your email!" });
    })
    .catch((err) => {
      res.status(400).send({ message: strings[lang].user_not_found });
    });
};

exports.verificationForgotPassword = (req, res) => {
  let { email, activation_token } = req.body;
  let lang = req.headers["accept-language"] || 'en';

  User.findOne({ where: { email, activation_token } })
    .then((user) => {
      let reset_token = crypto.randomBytes(32).toString("hex");
      user.activation_token = null;
      user.save();

      PasswordResets.create({
        email,
        token: bcrypt.hashSync(reset_token, 8),
      })
        .then(() => {
          res.status(200).send({ reset_token });
        })
        .catch((err) => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).send({ message: strings[lang].wrong_code });
    });
};

exports.resetPassword = (req, res) => {
  let { email, reset_token, password } = req.body;

  PasswordResets.findOne({ where: { email } })
    .then((response) => {
      var tokenIsValid = bcrypt.compareSync(reset_token, response.token);

      if (!tokenIsValid) {
        return res.status(401).send({
          message: "Invalid Token!",
        });
      }

      User.findOne({ where: { email } })
        .then(async (user) => {
          user.password = bcrypt.hashSync(password, 8);
          user.save();

          const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.jwtExpiration,
          });

          let refreshToken = await RefreshToken.createToken(user);

          res.status(200).send({
            accessToken: token,
            refreshToken: refreshToken,
          });
        })
        .catch((err) => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
