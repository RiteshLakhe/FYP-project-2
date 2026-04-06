const connectDB = require("../config/dbcon");
const propertyModel = require("../model/property.model");
const propertyData = require("../propertyData.json");

const normalizeProperty = (property) => {
  const normalizedType =
    property.propertyType === "Commercial Space"
      ? "Commercial"
      : property.propertyType;

  return {
    ...property,
    propertyType: normalizedType,
  };
};

const seedProperties = async () => {
  try {
    await connectDB();
    await propertyModel.deleteMany({});
    await propertyModel.insertMany(propertyData.map(normalizeProperty));
    console.log(`Seeded ${propertyData.length} properties successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding properties:", err);
    process.exit(1);
  }
};

seedProperties();
