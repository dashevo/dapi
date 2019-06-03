class GrpcError extends Error {
  /**
   * @param {string} message
   * @param {number} code
   * @param {Object} [metadata]
   */
  constructor(code, message, metadata = undefined) {
    super(message);

    this.code = code;
    this.metadata = metadata;

    Error.captureStackTrace(this.constructor);
  }

  getCode() {
    return this.code;
  }

  getMetadata() {
    return this.metadata();
  }
}

GrpcError.CODES = {
  INTERNAL: 13,
  INVALID_ARGUMENT: 3,
};

module.exports = GrpcError;
