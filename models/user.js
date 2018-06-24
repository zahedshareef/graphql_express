export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: DataTypes.STRING,
  });

  User.associate = (models) => {
    // 1 to many with board
    User.hasMany(models.Board, {
      foreignKey: 'owner',
    });
    // 1 to many with suggestion
    User.hasMany(models.Suggestion, {
      foreignKey: 'creatorId',
    });
  };

  return User;
};
