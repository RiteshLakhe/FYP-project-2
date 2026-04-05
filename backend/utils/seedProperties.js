const connectDB = require("../config/dbcon");
const propertyModel = require("../model/property.model");

const dummyProperties = [{
  "title": "Commercial Space in Jawalakhel",
  "description": "Prime commercial space in a busy market, ideal for retail or clinic setup.",
  "category": "Commercial Space",
  "propertyType": "Commercial",
  "address": "Jawalakhel, Lalitpur",
  "city": "Lalitpur",
  "area": "Jawalakhel",
  "municipality": "Lalitpur Metropolitan City",
  "wardNo": "5",
  "totalArea": 1200,
  "floor": "Ground Floor",
  "dimension": 50,
  "roadType": "Paved",
  "propertyFace": "East",
  "bedrooms": 0,
  "bathrooms": 1,
  "kitchens": 0,
  "furnishing": "Unfurnished",
  "balcony": 0,
  "attachedBathroom": "No",
  "suitable": "Retail, Clinic, Office",
  "floorLoad": 500,
  "powerBackup": "Yes",
  "liftAccess": "Yes",
  "pantryArea": "No",
  "parkingSpace": "2 Cars + Bike",
  "imgUrls": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAzS2sYP2wce9dLUVOH4ZKOn3qOsfW9ypMvw&s",
    "https://static.wixstatic.com/media/bf8702_5ec4969ad1d0423fb16612e61b2f8034~mv2.jpeg/v1/fill/w_738,h_511,al_c,q_85,enc_avif,quality_auto/bf8702_5ec4969ad1d0423fb16612e61b2f8034~mv2.jpeg",
    "https://img.freepik.com/free-photo/3d-rendering-business-meeting-working-room-office-building_105762-1972.jpg?semt=ais_hybrid&w=740",
    "https://plus.unsplash.com/premium_photo-1661963360360-32a37944ed87?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y29tbWVyY2lhbCUyMHNwYWNlfGVufDB8fDB8fHww",
    "https://www.metro-manhattan.com/wp-content/uploads/2024/06/iStock-1318513469.jpg"
  ],
  "price": 45000,
  "priceInWords": "Forty Five Thousand Rupees",
  "negotiable": "No",
  "userId": "6814ac57f21295f6d19bad2a",
  "status": "Active"
}];

const seedProperties = async () => {
  try {
    await connectDB();
    await propertyModel.insertMany(dummyProperties);
    console.log("✅ Dummy properties inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting dummy properties:", err);
    process.exit(1);
  }
};

seedProperties();
