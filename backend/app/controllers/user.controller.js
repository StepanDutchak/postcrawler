const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
// const admin = require('../config/firebase.config.js');
var admin = require("firebase-admin");
const db = require("../models");
const User = db.user;
const IdsUsersImages = db.ids_users_images;
const UsersImages = db.users_images;
const UsersSubscribers = db.users_subscribers;
const Information = db.information;
const Activities = db.activities;
const Sequelize = require("sequelize");
const strings = require("../strings");

var bcrypt = require("bcryptjs");


const upload = require("../middleware/upload");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

const getUserId = (req, res) => {
  let userId;
  let token = req.headers.authorization.replace("Bearer ", "");

  jwt.verify(token, config.secret, (err, decoded) => {
    console.log(decoded, config.secret);
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    userId = decoded.id;
    console.log("\n", userId, "\n");
  });

  console.log("USSSSEEEEERRRRRIDDDDD", userId);
  return userId;
};

exports.deleteImageUser = (req, res) => {
  let { id } = req.body;

  UsersImages.destroy({ where: { id } })
    .then((resp) => {
      res.status(200).send({ resp });
    }).catch(error => res.status(500).send({ error }))
}


exports.resetPassword = (req, res) => {
  let lang = req.headers["accept-language"] || 'en';
  let { password, old_password } = req.body;

  if (password < 6 || old_password < 6) {
    return res.status(405).send({
      message: strings[lang].invalid_password,
    });
  }

  User.findOne({ where: { id: getUserId(req, res) } })
    .then(async (user) => {
      var passwordIsValid = bcrypt.compareSync(old_password, user.password);

      if (!passwordIsValid) {
        return res.status(405).send({
          old_password: strings[lang].invalid_password,
        });
      }

      user.password = bcrypt.hashSync(password, 8);
      user.save();

      res.status(200).send({
        message: 'Reset password!'
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
}

exports.checkUsername = (req, res) => {
  let { username, id } = req.body;

  User.findOne({ where: { username, id: { [Sequelize.Op.not]: id } } })
    .then((user) => {
      if (user) {
        res.status(400).send({
          message: "Failed! Username is already in use!"
        });
        return;
      }
      res.status(200).send(true);
    }).catch(error => res.status(500).send({ error }))
}


exports.updateUser = async (req, res) => {
  try {
    await upload(req, res);

    const {
      username,
      first_name,
      last_name,
      email,
      telegram,
      instagram,
      description,
      id,
      status,
      gender,
      phone
    } = req.body;

    User.update(
      {
        username, first_name, last_name, description, status, gender, telegram,
        instagram, phone
      },
      {
        where: { id: getUserId(req, res) },
        attributes: [
          "id",
          "first_name",
          "last_name",
          "username",
          "email",
          "rating",
          "phone",
          "telegram",
          "instagram",
          "description",
          "status",
          "gender",
          "age",
          "verified_account"
        ],
        returning: true,
      }
    )
      .then(async () => {
        if (!User.hasAlias("images")) {
          User.belongsToMany(UsersImages, {
            as: "images",
            foreignKey: "user_id",
            otherKey: "image_id",
            through: IdsUsersImages,
          });
        }

        if (req.files && req.files?.length) {
          const images = req.files.map((item) => {
            return {
              filename: item.filename,
              user_id: id,
            };
          });

          await UsersImages.bulkCreate(images).then(async (image) => {
            let images = image.map((item) => {
              let el = Object.values(item)[0];
              return {
                user_id: id,
                image_id: el.id,
              };
            });

            await IdsUsersImages.bulkCreate(images);
          });
        }
        User.findOne({
          where: { id },
          attributes: [
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "rating",
            "description",
            "status",
            "phone",
            "telegram",
            "instagram",
            "gender",
            "age",
            "verified_account"
          ],
          include: [
            {
              as: "images",
              model: UsersImages,
              through: { attributes: [] },
              attributes: ["filename", "createdAt", "id"],
            },
          ],
          order: [["images", "createdAt", "DESC"]],
        })
          .then((user) =>
            res
              .status(200)
              .send({ ...user.dataValues, avatar: user.images[0]?.filename })
          )
          .catch((e) => res.status(400).send(e));
      })
      // .then((user) => res.status(200).send(user))
      .catch((err) => {
        return res.status(400).send(err);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.getMyUser = (req, res) => {
  let userId;
  let token = req.headers.authorization.replace("Bearer ", "");

  jwt.verify(token, config.secret, (err, decoded) => {
    console.log(decoded, config.secret);
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    userId = decoded.id;
    console.log("\n", userId, "\n");
  });

  if (!User.hasAlias("images")) {
    User.belongsToMany(UsersImages, {
      as: "images",
      foreignKey: "user_id",
      otherKey: "image_id",
      through: IdsUsersImages,
    });
  }

  // Fetch the user by id
  User.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "first_name",
      "last_name",
      "username",
      "email",
      "rating",
      "description",
      "telegram",
      "phone",
      "instagram",
      "status",
      "gender",
      "age",
      "verified_account"
    ],
    include: [
      {
        as: "images",
        model: UsersImages,
        through: { attributes: [] },
        attributes: ["filename", "createdAt", "id"],
      },
    ],
    order: [["images", "createdAt", "DESC"]],
  }).then(async (user) => {
    let followings =
      (await UsersSubscribers.count({
        where: { first_user_id: userId },
      })) || 0;
    let followers =
      (await UsersSubscribers.count({
        where: { second_user_id: userId },
      })) || 0;
    let activities =
      (await Activities.count({
        where: { user_id: userId },
      })) || 0;

    // Do something with the user
    return res.status(200).send({
      ...user.dataValues,
      avatar: user.images[0]?.filename,
      followers,
      followings,
      activities,
    });
  });
};

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, users, totalPages, currentPage };
};

exports.getFollowersAndFollowings = (req, res) => {
  const { user_id, type, page, size, username } = req.body;
  const { limit, offset } = getPagination(page, size);
  const myId = getUserId(req, res);
  const userData = {};
  const userDataFilter = {};

  if (username) {
    userDataFilter.username = { [Sequelize.Op.like]: `%${username}%` };
  }

  if (type === "followings") {
    userData.first_user_id = user_id;
    if (!UsersSubscribers.hasAlias("followings")) {
      UsersSubscribers.belongsTo(User, {
        as: "followings",
        foreignKey: "second_user_id",
        otherKey: "id",
      });
    }
  } else {
    userData.second_user_id = user_id;
    if (!UsersSubscribers.hasAlias("followers")) {
      UsersSubscribers.belongsTo(User, {
        as: "followers",
        foreignKey: "first_user_id",
        otherKey: "id",
      });
    }
  }

  if (!User.hasAlias("images")) {
    User.belongsToMany(UsersImages, {
      as: "images",
      foreignKey: "user_id",
      otherKey: "image_id",
      through: IdsUsersImages,
    });
  }

  UsersSubscribers.findAndCountAll({
    where: userData,
    limit,
    offset,
    include: [
      {
        as: type,
        model: User,
        where: userDataFilter,
        distinct: true,
        include: [
          {
            as: "images",
            model: UsersImages,
            through: { attributes: [] },
            attributes: ["filename", "createdAt"],
          },
        ],
        // through: { attributes: [] },
        attributes: ["id", "first_name", "last_name", "username", "rating", "verified_account", "phone"],
      },
    ],
  })
    .then((response) => {
      return Promise.all(
        response.rows.map(async (item) => {
          let data = item.dataValues[type].dataValues;

          const subscribe = await UsersSubscribers.findOne({
            where: { first_user_id: myId, second_user_id: data.id },
          });

          let user = {
            id: data.id,
            username: data.username,
            rating: data.rating,
            verified_account: data.verified_account,
            first_name: data.first_name,
            last_name: data.last_name,
            subscribe: !!subscribe,
            avatar:
              data.images.sort(function (a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              })[0]?.filename || null,
          };

          return user;
        })
      ).then((rows) => {
        return res
          .status(200)
          .send(getPagingData({ ...response, rows }, page, limit));
      });
    })
    .catch((error) => {
      return res.status(400).send({ message: error.message });
    });
};



// var serviceAccount = require("../config/peyon-18dc6-firebase-adminsdk-apb1j-8e8294c899.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://peyon-18dc6-default-rtdb.firebaseio.com/"
// })

exports.logout = (req, res) => {
  const myId = getUserId(req, res);

  User.findOne({
    where: {
      id: myId
    }
  }).then(user => {
    user.fcm_token = null;
    user.save();
    res.status(200).send({ message: "User subscribe!" });
  }).catch((error) => {
    res.status(400).send(error);
  })
}

exports.subscribeUser = (req, res) => {
  const { first_user_id, second_user_id } = req.body;

  UsersSubscribers.create({ first_user_id, second_user_id })
    .then((activity) => {
      User.findOne({
        where: {
          id: second_user_id
        }
      }).then(user => {
        if (user?.fcm_token) {
          let message = {
            notification: { title: "Новий читач", body: `За вами почав cтежити ${user.username}`, }, token: user.fcm_token
          };

          admin.messaging().send(message).catch((err) => console.log('error', err))
        }
      })

      res.status(200).send({ message: "User subscribe!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.unsubscribeUser = (req, res) => {
  const { first_user_id, second_user_id } = req.body;

  UsersSubscribers.destroy({ where: { first_user_id, second_user_id } })
    .then((activity) => {
      res.status(200).send({ message: "Activities unsubscribe!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getInformation = (req, res) => {
  const { id } = req.body;
  let lang = req.headers["accept-language"] || 'en';

  Information.findOne({ where: { id }, attributes: [[lang, "text"]], })
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUser = (req, res) => {
  const { user_id } = req.body;
  const myId = getUserId(req, res);

  if (!User.hasAlias("images")) {
    User.belongsToMany(UsersImages, {
      as: "images",
      foreignKey: "user_id",
      otherKey: "image_id",
      through: IdsUsersImages,
    });
  }

  // Fetch the user by id
  User.findOne({
    where: { id: user_id },
    attributes: [
      "id",
      "first_name",
      "last_name",
      "username",
      "email",
      "phone",
      "rating",
      "description",
      "telegram",
      "instagram",
      "status",
      "gender",
      "verified_account",
      "age",
    ],
    include: [
      {
        as: "images",
        model: UsersImages,
        through: { attributes: [] },
        attributes: ["filename", "createdAt", "id"],
      },
    ],
    order: [["images", "createdAt", "DESC"]],
  }).then(async (user) => {
    let subscribe = false;
    // Do something with the user
    await UsersSubscribers.findOne({
      where: { first_user_id: myId, second_user_id: user_id },
    }).then((resp) => (subscribe = !!resp));

    let followings =
      (await UsersSubscribers.count({
        where: { first_user_id: user_id },
      })) || 0;
    let followers =
      (await UsersSubscribers.count({
        where: { second_user_id: user_id },
      })) || 0;

    let activities =
      (await Activities.count({
        where: { user_id },
      })) || 0;

    return res.status(200).send({
      ...user.dataValues,
      avatar: user.images[0]?.filename,
      subscribe,
      followings,
      followers,
      activities,
    });
  });
};
