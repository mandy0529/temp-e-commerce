// mongoose require
const mongoose = require("mongoose");

// ---------------------------------------------

// ReviewSchema
const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please provide rating"]
  },
  title: {
    type: String,
    trim: true,
    required: [true, "Please provide review title"],
    maxlength: 100,
  },
  comment: {
    type: String,
    trim: true,
    required: [true, "Please provide review comment"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true
  }
}, { timestamps: true });

// 유저가 제품당 오직 하나의 리뷰를 남길 수 있게 index 처리하기
ReviewSchema.index({
  product: 1,
  user: 1
}, { unique: true });

// static methods
ReviewSchema.statics.minjiCalculateAverageRating = async function(productId) {

  // aggregate result
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);
  console.log(result, "@@@result");
  
  // update aggregate result
  try {
    await this.model("Product").findOneAndUpdate({ _id: productId }, {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numberOfReviews: result[0]?.numberOfReviews || 0
    });
  } catch (error) {
    console.log(error);
  }
};

// post save hook setting
ReviewSchema.post("save", async function() {
  await this.constructor.minjiCalculateAverageRating(this.product);
});

// post remove hook setting
ReviewSchema.post("remove", async function() {
  await this.constructor.minjiCalculateAverageRating(this.product);
});

// exports
module.exports = mongoose.model("Review", ReviewSchema);

