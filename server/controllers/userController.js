const multer = require('multer');
const jimp = require('jimp');

const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(
      '_id name email createdAt updatedAt'
    );
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getAuthUser = (req, res, next) => {
  if (!req.isAuthUser) {
    return res
      .status(405)
      .json({ messag: 'You are unauthenticated, Please sign in or sign up' });
    // return res.redirect(302, '/signin');
  }
  res.json(req.user);
};

exports.getUserById = async (req, res, next, id) => {
  try {
    const user = await User.findOne({ _id: id });
    req.profile = user;
    if (req.user && id === req.user.id) {
      req.isAuthUser = true;
    }
    next();
  } catch (err) {
    next(err);
  }
};

exports.getUserProfile = (req, res) => {
  if (!req.profile) {
    return res.status(404).json({ message: 'No user found' });
  }
  res.json(req.profile);
};

exports.getUserFeed = async (req, res, next) => {
  try {
    const { following, _id } = req.profile;
    following.push(_id);
    const users = await User.find({ _id: { $nin: following } }).select(
      '_id name avatar'
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const avatarUploadOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1
  },
  fileFilter: (req, file, next) => {
    next(null, file.mimetype.startsWith('image/'));
  }
};

exports.uploadAvatar = multer(avatarUploadOptions).single('avatar');

exports.resizeAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.avatar = `/static/uploads/avatars/${
      req.user.name
    }-${Date.now()}.${extension}`;
    const image = await jimp.read(req.file.buffer);
    await image.resize(250, jimp.AUTO);
    await image.write(`./${req.body.avatar}`);
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    req.body.updatedAt = new Date().toISOString();
    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (!req.isAuthUser) {
      return res
        .status(400)
        .json({ message: 'You are not authorized to perform this action' });
    }
    const { id } = req.profile;
    const user = await User.findOneAndDelete({ _id: id });
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.addFollowing = async (req, res, next) => {
  try {
    const { followId } = req.body;
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { following: followId } }
    );
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.addFollower = async (req, res, next) => {
  try {
    const { followId } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: followId },
      { $push: { followers: req.user.id } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.deleteFollowing = async (req, res, next) => {
  try {
    const { followId } = req.body;
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { following: followId } }
    );
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.deleteFollower = async (req, res, next) => {
  try {
    const { followId } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: followId },
      { $pull: { followers: req.user.id } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
