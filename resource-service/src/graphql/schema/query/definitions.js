
const { gql } = require('apollo-server');

const typeDefs = gql`
  extend type Query {
    item: Item @auth    
    items: [Item] @auth(requires: ADMIN)
  }
`;

module.exports = typeDefs;