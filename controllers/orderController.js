// Order model require
const Order = require("../models/Order");

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

// --------------------------------------------
// fakeStripeAPI function
const fakeStripeAPI = async (total) => {
  // 보호를 위한 secret key값
  const client_secret = "someRandomValue";

  // return client_secret, amount
  return {
    client_secret,
    total
  };
};

// create order
const createOrder = async (req, res) => {
  const {
    items: cartItems,
    tax,
    shippingFee
  } = req.body;

  // cartItems이 존재하지 않을 떄
  if (!cartItems || cartItems.length === 0) {
    throw new CustomError.BadRequestError("No cart items provided");
  }

  // tax 나 shippingFee 가 존재하지 않을 때
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
        "Please provide tax and shipping fee");
  }

  // for loop 위한 두개의 변수 지정
  let orderItems = [];
  let subtotal   = 0;

  // for loop setting
  // 나의 메모장에서 적은 req.body에서의 cartItems
  for (const item of cartItems) {
    // Product Model에서 우리의 dbProduct 아이 찾기
    const dbProduct = await Product.findOne({ _id: item.product });

    // dbProduct가 존재하지 않을 때
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
          `No product with id : ${item.product}`);
    }

    // Product Model에서의 우리의 찾을 수 있는 필드값
    const {
      name,
      price,
      image,
      _id,
    } = dbProduct;

    // amount는 우리의 Order Model에 있는 필드이기 때문에 메모장에서 적어준 아이를 loop돌린 아이에서의 amount값을
    // 찾아줘야하고, 나머지 값을은 Product Model 에서 찾은 값들을 만들어줘서 singleOrderItems라는 변수에 저장
    const singleOrderItems = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id
    };

    // amount가 존재하지 않을 때
    if (!singleOrderItems.amount) {
      throw new CustomError.BadRequestError(
          "please provide amount of order product");
    }

    // add item to order
    orderItems = [...orderItems, singleOrderItems];

    // calculate subtotal
    subtotal += item.amount * price;
  }

  // shippingFee + tax + subtotal 더한 가격
  const total = tax + shippingFee + subtotal;

  // get client secret
  const paymentIntent = await fakeStripeAPI(total);

  const totalOrder = await Order.create({
    orderItems,
    tax,
    shippingFee,
    subtotal,
    total,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  //  res 요청
  res.status(StatusCodes.CREATED).json(
      {
        totalOrder,
        clientSecret: totalOrder.clientSecret
      });
};

// get all orders
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});

  res.status(StatusCodes.OK).json({
    orders,
    count: orders.length
  });
};

// get single order
const getSingleOrder = async (req, res) => {
  // req.params에서 id 찾기
  const { id: orderId } = req.params;

  // findOne으로 해당 order 찾기
  const order = await Order.findOne({ _id: orderId });

  // order가 존재하지 않을 경우
  if (!order) {
    throw new CustomError.NotFoundError(
        `No product with id : ${orderId}`);
  }

  // chekPermissions 미들웨어로 허용성 확인
  checkPermissions(req.user, order.user);

  // 성공하면 res 요청
  res.status(StatusCodes.OK).json({
    order
  });
};

// get current user orders
const getCurrentUserOrders = async (req, res) => {
  // authenticateUser 미들웨어에서 등록한 나의 req.user를 넣어 find로 모든 orders 찾기
  const orders = await Order.find({ user: req.user.userId });

  // orders가 존재하지 않을 경우
  if (!orders || orders.length === 0) {
    throw new CustomError.NotFoundError("no orders in your info");
  }

  // 성공 할 경우, res 요청
  res.status(StatusCodes.OK).json({
    orders,
    count: orders.length
  });
};

// update order
const updateOrder = async (req, res) => {
  // 메모장 req.body에서 id 찾기
  const { id: orderId } = req.params;

  // 메모장 req.body에서 paymentId 찾기
  const { paymentId } = req.body;

  // id로 findOne해서 해당 order 찾기
  const order = await Order.findOne({ _id: orderId });

  // 만약 해당 order 가 없을 경우
  if (!order) {
    throw new CustomError.NotFoundError(
        `No product with id : ${orderId}`);
  }

  // 로그인한 유저만 접근 가능한 미들웨어로 확인
  checkPermissions(req.user, order.user);

  // 새로 도입한 값 update 해주고,status 상황 바꿔주기
  order.paymentId = paymentId;
  order.status    = "paid";

  // 바뀐거 save 해주기
  await order.save();

  // res 요청
  res.status(StatusCodes.OK).json({
    order
  });
};

// export all controllers
module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
  createOrder
};