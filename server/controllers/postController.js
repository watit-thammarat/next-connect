const multer = require('multer');
const jimp = require('jimp');

const Post = require('../models/Post');

const imageUploadOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1
  },
  fileFilter: (req, file, next) => {
    next(null, file.mimetype.startsWith('image/'));
  }
};

exports.uploadImage = multer(imageUploadOptions).single('image');

exports.resizeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.image = `/static/uploads/${
      req.user.name
    }-${Date.now()}.${extension}`;
    const image = await jimp.read(req.file.buffer);
    await image.resize(750, jimp.AUTO);
    await image.write(`./${req.body.image}`);
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.addPost = async (req, res, next) => {
  try {
    req.body.postedBy = req.user._id;
    let post = new Post(req.body);
    post = await post.save();
    await Post.populate(post, {
      path: 'postedBy',
      select: '_id name avatar'
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    if (!req.isPoster) {
      return res
        .status(400)
        .json({ message: 'You are not authorized to perform this action' });
    }
    const post = await Post.findOneAndDelete({ _id: req.post.id });
    res.json(post);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getPostById = async (req, res, next, id) => {
  try {
    const post = await Post.findOne({ _id: id });
    req.post = post;
    req.isPoster = req.user && post.postedBy._id.toString() === req.user.id;
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getPostsByUser = async (req, res, next) => {
  try {
    const posts = await Post.find({ postedBy: req.user.id }).sort({
      createdAt: 'desc'
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getPostFeed = async (req, res, next) => {
  try {
    const { _id, following } = req.profile;
    following.push(_id);
    const posts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: 'desc'
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.body;
    let post = await Post.findOne({ _id: postId });
    const liked = post.likes.find(l => l.toString() === req.user.id);
    if (liked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    post = await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.toggleComment = async (req, res, next) => {
  try {
    const { postId, comment } = req.body;
    let operator;
    let data;
    if (req.url.includes('uncomment')) {
      operator = '$pull';
      data = { _id: comment._id };
    } else {
      operator = '$push';
      data = { ...comment, postedBy: req.user._id };
    }
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      { [operator]: { comments: data } },
      { new: true }
    )
      .populate('postedBy', '_id name avatar')
      .populate('comments.postedBy', '_id name avatar');
    res.json(post);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
