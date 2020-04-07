const { SchemaDirectiveVisitor } = require('graphql-tools')
const {
  defaultValidationCallback,
  defaultErrorMessageCallback
} = require('./validators')

const prepareValidateScalar = require('./scalar')

const {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  printSchema
} = require('graphql')

const prepareConstraintDirective = (validationCallback, errorMessageCallback) =>
  class extends SchemaDirectiveVisitor {
   
    static getSDL() {
      const constraintDirective = this.getDirectiveDeclaration('constraint')
      const schema = new GraphQLSchema({
        directives: [constraintDirective]
      })
      return printSchema(schema)
    }

    static getDirectiveDeclaration(directiveName, schema) {
      return new GraphQLDirective({
        name: directiveName,
        locations: [DirectiveLocation.ARGUMENT_DEFINITION, DirectiveLocation.INPUT_FIELD_DEFINITION, DirectiveLocation.FIELD_DEFINITION],
        args: {
          /* Strings */
          minLength: { type: GraphQLInt },
          maxLength: { type: GraphQLInt },
          startsWith: { type: GraphQLString },
          endsWith: { type: GraphQLString },
          contains: { type: GraphQLString },
          notContains: { type: GraphQLString },
          pattern: { type: GraphQLString },
          format: { type: GraphQLString },
          differsFrom: { type: GraphQLString },
          equalTo: { type: GraphQLString },
          /* Numbers (Int/Float) */
          min: { type: GraphQLFloat },
          max: { type: GraphQLFloat },
          exclusiveMin: { type: GraphQLFloat },
          exclusiveMax: { type: GraphQLFloat },
          notEqual: { type: GraphQLFloat }
        }
      })
    }
    
    visitArgumentDefinition(argument, details) {
      // preparing resolver
      const originalResolver = details.field.resolve
      details.field.resolve = async (...resolveArgs) => {
        const argName = argument.name
        const args = resolveArgs[1] // (parent, args, context, info)        

        const valueToValidate = args[argName]        

        this.validate(argName, valueToValidate);

        return originalResolver.apply(this, resolveArgs)
      }
    }

    visitInputFieldDefinition(field) {                  
      this.wrapType(field);
    }

    visitFieldDefinition(field) {      
      this.wrapType(field);
    }

    wrapType(field) {
      const fieldName = field.astNode.name.value;
      const type = field.type.ofType || field.type;
      const isNotNull = (field.type instanceof GraphQLNonNull);
      const isScalarOfTypeString = (type === GraphQLString);
      const isScalarOfTypeNumber = (type === GraphQLInt || type === GraphQLFloat);

      if (!isScalarOfTypeString && !isScalarOfTypeNumber) {
        throw new Error(`Not a scalar of type ${type}`);
      }

      if (isScalarOfTypeString) {
        const StringType = prepareValidateScalar('ValidateString', value => this.validate(fieldName, value))
        field.type = new StringType(fieldName, type, this.args);
      }

      if (isScalarOfTypeNumber) {
        const NumberType = prepareValidateScalar('ValidateNumber', value => this.validate(fieldName, value))
        field.type = new NumberType(fieldName, type, this.args);
      }

      if (isNotNull) {
        field.type = new GraphQLNonNull(field.type);
      }
    }

    validate(argName, value) {
      const errors = Object.keys(this.args)
        .map(key => validationCallback({ argName, cName: key, cVal: this.args[key], data: value }))
        .filter(x => !x.result)
        .map(errorMessageCallback)

      if (errors && errors.length > 0) throw new Error(errors)
      return true;
    }
  }

module.exports = {
  constraint: prepareConstraintDirective(
    defaultValidationCallback,
    defaultErrorMessageCallback
  ),
  prepareConstraintDirective,
  ...require('./validators')
}