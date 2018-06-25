import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';
import { requiresAdmin } from './permissions';
import { refreshTokens, tryLogin } from './auth';

export const pubSub = new PubSub();

const USER_ADDED = 'USER_ADDED';

export default {
  Subscription: {
    userAdded: {
      subscribe: () => pubSub.asyncIterator(USER_ADDED),
    },
  },
  User: {
    boards: ({ id }, args, { models }) => models.Board.findAll({
      where: {
        owner: id,
      },
    }),
    suggestions: ({ id }, args, { models }) => models.Suggestion.findAll({
      where: {
        creatorId: id,
      },
    }),
  },
  Board: {
    suggestions: ({ id }, args, { models }) => models.Suggestion.findAll({
      where: {
        boardId: id,
      },
    }),
  },
  Suggestion: {
    creator: ({ creatorId }, args, { models }) => models.User.findOne({
      where: {
        id: creatorId,
      },
    }),
  },
  Query: {
    allUsers: (parent, args, { models }) => models.User.findAll(),
    me: (parent, args, { models, user }) => {
      if (user) {
        // user logged in
        return models.User.findOne({
          where: {
            id: user.id,
          },
        });
      }
      // not logged in
      return null;
    },
    userBoards: (parent, { owner }, { models }) => models.Board.findAll({
      where: {
        owner,
      },
    }),
    userSuggestions: (parent, { creatorId }, { models }) => models.Suggestion.findAll({
      where: {
        creatorId,
      },
    }),
  },

  Mutation: {
    updateUser: (parent, { username, newUsername }, { models }) => models.User.update(
      { username: newUsername }, { where: { username } },
    ),
    deleteUser: (parent, args, { models }) => models.User.destroy({ where: args }),
    createBoard: requiresAdmin.createResolver(
      (parent, args, { models }) => models.Board.create(args),
    ),
    createSuggestion: (parent, args, { models }) => models.Suggestion.create(args),
    createUser: async (parent, args, { models }) => {
      const user = args;
      user.password = 'idk';
      const userAdded = await models.User.create(user);
      pubSub.publish(USER_ADDED, {
        userAdded,
      });
      return userAdded;
    },
    register: async (parent, args, { models }) => {
      const user = args;
      user.password = await bcrypt.hash(user.password, 12);
      return models.User.create(user);
    },
    login: async (parent, { email, password }, { models, SECRET },
    ) => tryLogin(email, password, models, SECRET),
    refreshTokens: (parent, { token, refreshToken }, { models, SECRET }) => refreshTokens(
      token,
      refreshToken,
      models,
      SECRET,
    ),
  },
};
