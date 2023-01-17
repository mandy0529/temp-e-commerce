// Review model require
const Review = require("../models/Review");

// Product model require
const Product = require("../models/Product");

// StatusCodes require
const { StatusCodes } = require("http-status-codes");

// errors require
const CustomError = require("../errors");

// tokenUser require
const {
        createTokenUser,
        attachCookiesToResponse,
        checkPermissions
      } = require("../utils/index");

// ---------------------------------------

// create review
const createReview = async (req, res) => {
  const { product: productId } = req.body;

  // 1. productId 체크
  // productId 찾기
  const isValidProduct = await Product.findOne({ _id: productId });

  // 해당 productId가 존재하지 않을때 에러 처리
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  // 2. 이미 유저가 이 제품에 관해서 리뷰를 남겼을 경우 체크
  // productId 와 userId 가 이미 존재하는 경우를 찾기
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId
  });

  // 유저가 이미 review를 남긴 경우 에러 처리
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product");
  }

  // review가 만들어질때 누가 썼는지 알 수 있도록 userId 와
  // authentication middleware
  // req.user에서 정보를 가져와서 우리의 req.body에 담아주기
  req.body.user = req.user.userId;

  // req.body 내용으로 create 해주기
  const review = await Review.create(req.body);

  // res 요청
  res.status(StatusCodes.CREATED).json({ review });

};

// get all reviews
const getAllReviews = async (req, res) => {
  // find all reviews
  // populate 사용해서 이 댓글을 작성한 사람의 이름과 이메일을 확인하고싶다.
  const reviews = await Review.find({}).populate({
    path: "user",
    select: "name email"
  }).populate({
    path: "product",
    select: "company"
  });

  // res 요청
  res.status(StatusCodes.OK).json({
    reviews,
    count: reviews.length
  });
};

// get single review
const getSingleReview = async (req, res) => {
  // req.params에서 Id 꺼내기
  const { id: reviewId } = req.params;

  // findOne id
  const review = await Review.findOne({ _id: reviewId });

  // 해당 Id가 존재하지 않을때
  if (!reviewId) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  // res 요청
  res.status(StatusCodes.OK).json({
    review,
  });
};

// update review
const updateReview = async (req, res) => {
  // req.params에서 Id 꺼내기
  const { id: reviewId } = req.params;

  // rating, title, comment 내가 변경하려고 꾸민 나의 메모장 req.body에서 꺼내주기
  const {
          rating,
          comment,
          title
        }      = req.body;
  // findOne id
  const review = await Review.findOne({ _id: reviewId });

  // 해당 Id가 존재하지 않을 때
  if (!reviewId) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  // 권한 있는지 checkPermissions middleware로 확인
  checkPermissions(req.user, review.user);

  // 나의 model에서 찾은 review의 각각 값들을 나의 메모장에서 변경할 body에서 꺼낸 아이들을 갖게 만든다.
  review.rating  = rating;
  review.comment = comment;
  review.title   = title;

  // 저장해주자
  await review.save();

  // res 요청
  res.status(StatusCodes.OK).json({
    review
  });
};

// delete review
const deleteReview = async (req, res) => {
  // req.params에서 Id 꺼내기
  const { id: reviewId } = req.params;

  // findOne id
  const review = await Review.findOne({ _id: reviewId });

  // 해당 Id가 존재하지 않을때
  if (!reviewId) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  // 권한 있는지 checkPermissions middleware로 확인
  checkPermissions(req.user, review.user);

  // 해당 review 지워주기
  await review.remove();

  // res 요청
  res.status(StatusCodes.OK).json({
    msg: "Success! Review removed "
  });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;

  const reviews = await Review.find({ product: productId });

  if (!productId) {
    throw new CustomError.NotFoundError(`No review with id ${productId}`);
  }

  if (reviews.length === 0) {
    throw new CustomError.BadRequestError(`No reviews for this product`);
  }

  res.status(StatusCodes.OK).json({
    reviews,
    count: reviews.length
  });

};

// exports all controllers
module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews
};