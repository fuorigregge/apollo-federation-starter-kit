
const { gql } = require('apollo-server');

const typeDefs = gql`

  input CreateUserInput {   
    email: String! @constraint(format: "email")
    repeat_email: String! @constraint(format: "email")    
    first_name: String!
    last_name: String!    
    password: String! @constraint(minLength: 5, maxLength: 10)   
  } 

  extend type Mutation {
    login(username: String! @constraint(format: "email"), password: String! @constraint(minLength: 5), remember: Boolean): Token!
    createAccount(user: CreateUserInput!): String!
    refreshToken: Token! @auth           
    verifyAccount(token:String!): String!    
    forgotPassword(username: String!): Token!    
    resetPassword(resetToken: String!, password: String!): String      
  }
`;

module.exports = typeDefs;
