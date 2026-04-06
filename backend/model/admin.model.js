const mongoose = require("mongoose");

const adminModel = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Fullname is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    roles: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

adminModel.statics.adminExists = async function () {
  const adminCount = await this.countDocuments({ roles: "admin" });
  return adminCount >= 1;
};

module.exports = mongoose.model("Admin", adminModel);
