const { typeDefs, resolvers } = require('graphql-scalars')
const { gql } = require('apollo-server')

module.exports = [
    require('./schema/types'),
    require('./schema/query'),
    require('./schema/mutation'),
    { typeDefs: gql`${typeDefs}`, resolvers }
]