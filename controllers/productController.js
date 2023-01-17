// product require
const Product = require("../models/Product");

// http-status-codes library require
const { StatusCodes } = require("http-status-codes");

// custom error require
const CustomError = require("../errors");

// path require
const path = require("path");

//-----------------------------------------------------

// create product
const createProduct = async (req, res) => {
  // authentication middleware req.user에서 정보를 가져와서 우리의 req.body에 담아주기
  req.body.user = req.user.userId;

  // 우리의 req.body 내용을 담아 create 해주기
  const product = await Product.create(req.body);

  // res.send 보내주기
  res.status(StatusCodes.CREATED).json({ product });
};

// get all products
const getAllProducts = async (req, res) => {
  // 나의 products 찾기
  const products = await Product.find({});

  // res 요청 보내주기
  res.status(StatusCodes.OK).json({
    products,
    count: products.length
  });
};

// get single product
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate("minji"); // review
                                                                               // populate
  // productId 가 존재하지 않을 때
  if (!product) {

    throw new CustomError.NotFoundError(
        `No product with id ${productId}`);
  }

  // res 요청 보내주기
  res.status(StatusCodes.OK).json({ product });
};

// update product
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  // findOneAndUpdate(currentCondition, update, option, callback)
  const product = await Product.findOneAndUpdate(
      { _id: productId },
      req.body,
      {
        new: true,
        runValidators: true
      }
  );

  // product 가 존재하지 않을 때
  if (!product) {
    throw new CustomError.NotFoundError(
        `No product with id ${productId}`);
  }

  // res 요청 보내주기
  res.status(StatusCodes.OK).json({ product });
};

// delete product
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  // 해당 product 찾아주기
  const product = await Product.findOne({ _id: productId });

  // productId 가 존재하지 않을 때
  if (!product) {
    throw new CustomError.NotFoundError(
        `No product with id ${productId}`);
  }

  // 해당 product 지워주기
  await product.remove();

  // res 요청 보내주기
  res.status(StatusCodes.OK).json({ msg: "Success! Product Removed ." });
};

// upload Image
const uploadImage = async (req, res) => {
  // req.files가 없을 때
  if (!req.files) {
    throw new CustomError.BadRequestError("No file uploaded");
  }
  // image 형식대로 뺴서 변수 지정
  const productImage = req.files.image;

  // type이 image가 아닐 때
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  // 내가 정해놓은 max size보다 클 경우
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
        "Please upload image smller than 1MB");
  }

  // image가 어디 uploade 될지 imagePath를 정해주자
  const imagePath = path.join(__dirname,
      `../public/uploads/${productImage.name}`
  );

  // mv function에 우리의 imagePath 경로 담아주기
  await productImage.mv(imagePath);

  // res 요청 보내주기
  res.status(StatusCodes.OK).json({ image: `/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage
};