const mongoose = require("mongoose");
require("dotenv/config");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

module.exports = connectDB;
