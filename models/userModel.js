const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    matric: {
      type: String,
      required: false,
    },
    occupation: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: false,
    },
    qr_code: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
