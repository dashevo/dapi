function isInteger(number) {
  return typeof number === 'number' && !isNaN(number) && number === parseInt(number, 10);
}

module.exports = isInteger;
