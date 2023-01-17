// express require
const express = require("express");

// router require
const router = express.Router();

// authenticate function require
const {
        authenticateUser,
        authorizePermissions
      } = require("../middleware/authentication");

// orderController require
const {
        createOrder,
        updateOrder,
        getAllOrders,
        getCurrentUserOrders,
        getSingleOrder
      } = require("../controllers/orderController");

// -------------------------------------------------------------

// router setting
router.route("/").post(authenticateUser, createOrder).get(authenticateUser,
  authorizePermissions("admin"), getAllOrders
);
// ⚠️ single 아이들 받아오는 route보다 항상 먼저 쓸 것!!!!!!!!!!!
router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);

router.route("/:id").patch(authenticateUser, updateOrder).get(authenticateUser,
  getSingleOrder
);

// export router
module.exports = router;