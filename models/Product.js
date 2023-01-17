// mongoose require
const mongoose = require("mongoose");

// ---------------------------------------------------

// schema
const ProductSchema = new mongoose.Schema({
  // 제품을 다루는 아이들
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide product name"],
    maxlength: [100, "Name can not be more than 100"]
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    default: 0
  },
  description: {
    type: String,
    required: [true, "Please provide product description"],
    maxlength: [1000, "Name can not be more than 1000 "]
  },
  image: {
    type: String,
    default: "/uploads/couch.png"
  },
  category: {
    type: String,
    enum: ["office", "kitchen", "bedroom"],
    required: [true, "Please provide product category"]
  },
  company: {
    type: String,
    required: [true, "Please provide product company"],
    enum: {
      values: ["ikea", "liddy", "marcos"],
      message: "{VALUE} is not supported"
    }
  },
  colors: {
    type: [String],
    default: ["#222"],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  inventory: {
    type: Number,
    required: true,
    default: 15
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  // 어떤 user 냐에 따라 product 담기는 그릇이 달라지므로 정해주어야 한다.
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

// virtual을 이용해서 populate용 가상 변수를 설정 가능
ProductSchema.virtual("minji", {
  ref: "Review", // 참조할 collections
  localField: "_id", // 현재 스키마에 선언 되어있는 참조할 필드
  foreignField: "product", // collections에서 참조할 필드
  justOne: false, // 하나만 반환하는지에 대한 여부
  // match: { rating: 5 } // filter 조건 매칭
});

// product가 삭제가 된다면 그아이가 가지고있는 reviews도 지워주기
ProductSchema.pre("remove", async function() {
  await this.model("Review").deleteMany({ product: this._id });
});

// export
module.exports = mongoose.model("Product", ProductSchema);