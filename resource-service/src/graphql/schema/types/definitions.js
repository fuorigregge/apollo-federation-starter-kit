
const { gql } = require('apollo-server');

const typeDefs = gql`

  directive @constraint(    
    minLength: Int
    maxLength: Int    
  ) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

  directive @auth(
    requires: Role = USER,
  ) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    EDITOR
    USER    
  }

  type Item @key(fields: "id"){
    id: ID!
    name: String
    description: String
    user: User
    user_id: String!
  }
  
  extend type User @key(fields: "id") {
    id: String! @external
    items: [Item]
  }
`;

module.exports = typeDefs;