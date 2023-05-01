const bcrypt = require("bcrypt");

async function hashPassword(plaintextPswd) {
  const hash = await bcrypt.hash(plaintextPswd, 10);
  return hash;
}

async function comparePassword(plaintextPswd, hash) {
  const res = await bcrypt.compare(plaintextPswd, hash);
  return res;
}

module.exports = {
  hashPassword,
  comparePassword
};
