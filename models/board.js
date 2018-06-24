export default (sequelize, DataTypes) => {
  const Board = sequelize.define('board', {
    name: DataTypes.STRING,
  });

  Board.associate = (models) => {
    // 1 to many with Suggestion
    Board.hasMany(models.Suggestion, {
      foreignKey: 'boardId',
    });
  };

  return Board;
};
