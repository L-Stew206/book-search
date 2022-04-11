const { AuthenticationError } = require('apollo-server-express');
const { User } = require("../models");
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({_id: context.user._id}).select("-__v -password"
                );

                    return userData;
            }
            throw new AuthenticationError ("Not Logged In")
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError
                ("Incorrect email");
            }

            const correctPassword = await user.isCorrect(password);

            if (!correctPassword) throw new AuthenticationError("Incorrect Password");

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { userId, book }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                  { _id: userId },
                  { $addToSet: { books: book } },
                  {
                    new: true,
                    runValidators: true,
                  }
                );
              }
              throw new AuthenticationError("Please log in first.");
            },

        removeBook: async (parent, { book }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                  { _id: context.user._id },
                  { $pull: { books: book } },
                  { new: true }
                );
              }
              throw new AuthenticationError("Please log in first.");
            },
          },
        };
        
module.exports = resolvers; 