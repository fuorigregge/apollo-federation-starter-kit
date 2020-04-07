
const { gql } = require('apollo-server');

const typeDefs = gql`        

  directive @constraint(    
    minLength: Int
    maxLength: Int    
    format: String
  ) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

  directive @auth(
    requires: Role = USER,
  ) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    EDITOR
    USER    
  }

  type User @key(fields: "id"){
    id: String!    
    name: String!    
    role: String 
    auth: Credentials! @auth(requires: ADMIN)
    profile: Profile!      
    created_at: DateTime!
    hasRole(role: Role!): Boolean
  }  
  
  type Profile{
    first_name: String
    last_name:String    
  }
  
  type Credentials {
    username: String!
    verified: Boolean    
  }

  type Token {
    token: String!
  }   
  
`;

module.exports = typeDefs;