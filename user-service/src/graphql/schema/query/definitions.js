
const { gql } = require('apollo-server');

const typeDefs = gql`
  extend type Query {
    me: User @auth    
  }
`;

module.exports = typeDefs;