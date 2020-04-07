const { SchemaDirectiveVisitor } = require('graphql-tools')
const { defaultFieldResolver } = require("graphql");

/**
 * @todo add some basic logic
 */
const defaultAuthCallback = () => true;

const defaultAuthError = () => { throw new Error("Not authorized") };

const prepareAuthDirective = (authCallback = defaultAuthCallback, authError = defaultAuthError) =>

    class extends SchemaDirectiveVisitor {

        static getDirectiveDeclaration(directiveName, schema) {
            const previousDirective = schema.getDirective(directiveName);

            const roleType = schema.getType('Role');

            if (!roleType) {
                throw new Error("you must declare Role enum type")
            }

            const roles = roleType.getValues();

            if (previousDirective) {

                previousDirective.args.forEach(arg => {
                    if (arg.name === 'requires' && !arg.defaultValue) {
                        arg.defaultValue = roles[roles.length - 1].value
                    }
                });

                return previousDirective;
            }

            return null;

        }

        visitObject(type) {
            this.ensureFieldsWrapped(type);
            type._requiredAuthRole = this.args.requires;
        }

        visitFieldDefinition(field, details) {
            this.ensureFieldsWrapped(details.objectType);
            field._requiredAuthRole = this.args.requires;
        }

        ensureFieldsWrapped(objectType) {

            if (objectType._authFieldsWrapped) return;
            objectType._authFieldsWrapped = true;

            const fields = objectType.getFields();

            const rolesObj = this.schema
                .getType('Role')
                .getValues()
                .reduce((acc, val) => {
                    acc[val.name] = val.value;
                    return acc;
                }, {});

            Object.keys(fields).forEach(fieldName => {
                const field = fields[fieldName];
                const { resolve = defaultFieldResolver } = field;
                field.resolve = async function (...args) {

                    const requiredRole =
                        field._requiredAuthRole ||
                        objectType._requiredAuthRole;

                    if (!requiredRole) {
                        return resolve.apply(this, args);
                    }

                    if (!await authCallback(requiredRole, rolesObj, ...args)) {
                        authError(requiredRole, rolesObj, ...args)
                    }

                    return resolve.apply(this, args);
                };
            });
        }
    }


module.exports = {
    auth: () => prepareAuthDirective(defaultAuthCallback, defaultAuthError),
    prepareAuthDirective,
}
