
const mongoose = require('mongoose');
require('dotenv').config();
const adminModel = require('./model/admin.model');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const result = await adminModel.deleteMany({});
    console.log(`Deleted ${result.deletedCount} admin(s). Restart server to recreate.`);
    await mongoose.disconnect();
  } catch (e) {
    console.error(e.message);
  }
}

resetAdmin();

