
const { gql } = require('apollo-server');

const typeDefs = gql`

  input CreateItemInput {   
    name: String! @constraint(minLength: 5)
    description: String
  } 

  extend type Mutation {    
    createItem(item: CreateItemInput!): String! @auth
  }
`;

module.exports = typeDefs;
