const express = require("express");
const router = express.Router();
const { hashPassword } = require("../utilities/functions");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const qr = require("qrcode");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "itshamzy@gmail.com",
    pass: "kysvpggwwwcfbzdr",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async ({ userEmail, mode, password }) => {
  let qrImage;
  if (mode == "qr_code") {
    if (
      !password ||
      (typeof password !== "string" && typeof password !== "number")
    ) {
      throw new Error("Invalid data for QR code encoding");
    }
    qrImage = await qr.toDataURL(password.toString());
  }

  const mailOptions = {
    from: "itshamzy@gmail.com",
    to: userEmail,
    subject: `Your ${mode.toUpperCase()} for login`,
    text: mode == "otp" ? `Your  ${mode.toUpperCase()}  is ${password}` : "",
    attachments:
      mode == "qr_code"
        ? [
            {
              filename: "qrcode.png",
              content: qrImage.split(";base64,").pop(),
              encoding: "base64",
            },
          ]
        : [],
  };

  const res = transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return false;
    } else {
      console.log(`OTP email sent to ${mailOptions.to}: ${info.response}`);
      return true;
    }
  });

  return res;
};

router.get("/", (req, res) => res.send("Hi auth"));

router.post("/login", async (req, res) => {
  const users = await User.find();

  const data = {
    email: req.body.email,
    password: req.body.password,
    mode: req.body.mode,
  };

  const userEmail = users.findIndex(
    (user) => user.email.toLowerCase() === data.email.toLowerCase()
  );
  if (userEmail < 0)
    return res
      .status(403)
      .json({ message: "No such email found in our database" });
  const user = users[userEmail];

  if (data.mode == "otp" && user.otp == data.password) {
    return res.status(200).json({ user, message: "login successful" });
  } else if (data.mode == "qr_code" && user.qr_code == data.password) {
    return res.status(200).json({ user, message: "Login successful" });
  } else {
    return res.status(403).json({ message: `Incorrect ${data.mode} supplied` });
  }
});

router.post("/login-mode", async (req, res) => {
  const users = await User.find();

  const data = {
    email: req.body.email,
    mode: req.body.mode,
  };

  const userEmail = users.findIndex(
    (user) => user.email.toLowerCase() === data.email.toLowerCase()
  );
  if (userEmail < 0)
    return res.status(403).json({ message: "No such record in our database" });
  const rand = Math.floor(Math.random() * 900000 + 100000);

  if (data.mode == "otp") {
    await User.findOneAndUpdate(
      { email: data.email },
      { otp: rand },
      {
        new: true,
      }
    );
    sendMail({
      userEmail: data.email,
      mode: data.mode,
      password: rand,
    });
    return res.status(200).json({ message: "OTP sent successfully" });
  } else {
    await User.findOneAndUpdate(
      { email: data.email },
      { qr_code: rand },
      {
        new: true,
      }
    );
    sendMail({
      userEmail: data.email,
      mode: data.mode,
      password: rand,
    });
    return res.status(200).json({ message: "QR code sent successfully" });
  }
});

router.post("/register", async (req, res) => {
  const rand = Math.floor(Math.random() * 90000 + 10000);
  const data = {};

  const users = await User.find();
  data.password = await hashPassword(req.body.password);
  data.name = req.body.name;
  data.email = req.body.email;
  data.phone = req.body.phone;
  data.occupation = req.body.occupation;
  data.matric = `${rand}CT`;

  const usedEmail = users.findIndex((user) => user.email === data.email);
  if (usedEmail >= 0) {
    return res
      .status(409)
      .json({ message: "Email already exist. Choose another one" });
  }
  try {
    const user = new User(data);
    const newUser = await user.save();
    delete newUser.password;
    res
      .status(201)
      .json({ user: newUser, message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    res.status(200).json({ user, message: "user retrieved successfully" });
  } catch (error) {
    res.status(400).json({ error, message: "Error retrieving student data" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ error, message: "Error fetching users" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    const user = await User.findByIdAndUpdate(
      _id,
      { ...req.body },
      { new: true }
    );
    res.status(200).json({ message: "Update successful", data: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
