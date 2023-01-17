require("dotenv").config();
require("express-async-errors");

// express require
const express = require("express");
const app     = express();

// port require
const port = process.env.PORT || 5000;

// routers require
const authRouter    = require("./routes/authRoute");
const userRouter    = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const reviewRouter  = require("./routes/reviewRoute");
const orderRouter   = require("./routes/orderRoute");

// database require
const connectDB = require("./db/connect");

// middleware require
const notFoundMiddleware     = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// rest of the packages require
const morgan        = require("morgan");
const cookieParser  = require("cookie-parser");
const cors          = require("cors");
const fileUpload    = require("express-fileupload");
const rateLimiter   = require("express-rate-limit");
const helmet        = require("helmet");
const xss           = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

//  ----------------------------------------------------------------------------

// json middleware
// ⚠️ routes 코드 앞에 쓸 것
app.use(express.json());


// cookie middleware
app.use(cookieParser(process.env.JWT_SECRET));

// fileUpload middleware
app.use(express.static("./public"));
app.use(fileUpload());

// front-end connect
app.use(express.static("./front-end"));

// cors
app.use(cors());

// 프록시 환경에서 Express 사용
app.set("trust proxy", 1);

// rate limiter
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60
}));

// helmet
app.use(helmet());

// xss-clean
app.use(xss());

// mongo sanitize
app.use(mongoSanitize());

// Routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// 404, errorHandler middleware
// ⚠️ routes 코드 뒤에 쓸 것
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// start server function
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();