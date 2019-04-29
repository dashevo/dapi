const Ajv = require('ajv');
const ArgumentsValidationError = require('../errors/ArgumentsValidationError');

class Validator {
  constructor(schema) {
    const ajv = new Ajv({
      $data: true,
    });

    ajv.addKeyword('getTransactionsByAddressFromToRange50', {
      schema: false,
      validate(data) {
        const { from } = data;
        const { to } = data;
        if (from !== 'undefined' && to !== 'undefined' && to - from > 50) {
          return false;
        }
        return true;
      },
    });

    ajv.addKeyword('getUTXOFromToRange1000', {
      schema: false,
      validate(data) {
        const { from } = data;
        const { to } = data;
        if (from !== 'undefined' && to !== 'undefined' && (to - from > 1000)) {
          return false;
        }
        return true;
      },
    });

    this.validateArguments = ajv.compile(schema);
  }

  validate(args) {
    if (!this.validateArguments(args)) {
      if (this.validateArguments.errors[0].keyword === 'getTransactionsByAddressFromToRange50') {
        throw new ArgumentsValidationError(`"from" (${args.from}) and "to" (${args.to}) range should be less than or equal to 50`);
      } else if (this.validateArguments.errors[0].keyword === 'getUTXOFromToRange1000') {
        throw new ArgumentsValidationError(`"from" (${args.from}) and "to" (${args.to}) range should be less than or equal to 1000`);
      } else {
        throw new ArgumentsValidationError(`params${this.validateArguments.errors[0].dataPath} ${this.validateArguments.errors[0].message}`);
      }
    }
  }
}

module.exports = Validator;
