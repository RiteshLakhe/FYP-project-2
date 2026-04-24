const connectDB = require("../config/dbcon");
const { bootstrapData } = require("./bootstrapData");

const seedProperties = async () => {
  try {
    await connectDB();
    const summary = await bootstrapData();
    console.log(`Seeded ${summary.propertyCount} properties successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding properties:", err);
    process.exit(1);
  }
};

seedProperties();
