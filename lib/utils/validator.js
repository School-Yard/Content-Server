/**
 * Custom Error Handler for node-validator
 */

var Validator = module.exports = require('validator').Validator;

Validator.prototype.error = function (msg) {
  this._errors.push(msg);
  return this;
};

Validator.prototype.getErrors = function () {
  return this._errors;
};