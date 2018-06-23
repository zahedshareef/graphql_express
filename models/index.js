import Sequelize from 'sequelize';

const sequelize = new Sequelize('test_graphql_db', 'test_graphql_admin', 'imapassword', {
    host: 'localhost',
    dialect: 'postgres'
});

const db = {
    User: sequelize.import('./user'),
};

db.sequelize = sequelize;
// db.Sequelize = Sequelize;

export default db;