module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING,
    },
    first_name: {
      type: Sequelize.STRING,
    },
    last_name: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    activation_token: {
      type: Sequelize.STRING,
    },
    email_verified: {
      type: Sequelize.BOOLEAN,
    },
    registration_completed: {
      type: Sequelize.BOOLEAN,
    },
    email: {
      type: Sequelize.STRING,
    },

    verified_account: {
      type: Sequelize.BOOLEAN,
    },
  });

  return User;
};
