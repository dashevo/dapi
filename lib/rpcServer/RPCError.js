class RPCError extends Error {
  constructor(code, message, originalStack) {
    super(message);
    this.code = code;
    this.message = message;
    if (originalStack) {
      this.stack = originalStack;
    }
  }
}

module.exports = RPCError;
