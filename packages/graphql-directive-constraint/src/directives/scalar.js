const { GraphQLScalarType } = require('graphql');

const prepareValidateScalar = (name, validate) =>
    class extends GraphQLScalarType {
        constructor(fieldName, type, args) {
            super({
                name: name,
                serialize(value) {
                    value = type.serialize(value);
                    validate(value)                    
                    return value;
                },
                parseValue(value) {
                    value = type.serialize(value);
                    validate(value)                    
                    return type.parseValue(value);
                },
                parseLiteral(ast) {
                    const value = type.parseLiteral(ast);
                    validate(value)                    
                    return value;
                },
            });
        }
    }

module.exports = prepareValidateScalar;