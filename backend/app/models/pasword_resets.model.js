module.exports = (sequelize, Sequelize) => {
    const PasswordResets = sequelize.define("password_resets", {
      email: {
        type: Sequelize.STRING,
      },
      token: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
    });
  
    return PasswordResets;
  };
  