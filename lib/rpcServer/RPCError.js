class RPCError {
  constructor(code, message, originalStack) {
    this.code = code;
    this.message = message;
    if (originalStack) {
      this.stack = originalStack;
    }
  }
}

module.exports = RPCError;
