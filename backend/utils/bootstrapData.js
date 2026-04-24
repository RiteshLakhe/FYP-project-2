const bcrypt = require("bcrypt");
const adminModel = require("../model/admin.model");
const userModel = require("../model/user.model");
const propertyModel = require("../model/property.model");
const propertyData = require("../propertyData.json");

const fallbackProperty = {
  title: "Riverside Family Apartment in Kapan",
  description: "Bright family apartment with open views, nearby schools, and easy ring road access.",
  category: "Appartment",
  propertyType: "Residential",
  address: "Kapan Height, Kathmandu",
  city: "Kathmandu",
  area: "Kapan",
  municipality: "Budhanilkantha Municipality",
  wardNo: "10",
  totalArea: 960,
  floor: "3rd Floor",
  dimension: 32,
  roadType: "Paved",
  propertyFace: "North-East",
  bedrooms: 3,
  bathrooms: 2,
  kitchens: 1,
  furnishing: "Semi-Furnished",
  balcony: 2,
  attachedBathroom: "Yes",
  suitable: "Family",
  floorLoad: 320,
  powerBackup: "Yes",
  liftAccess: "Yes",
  pantryArea: "Yes",
  parkingSpace: "1 Car + 2 Bikes",
  imgUrls: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
  ],
  price: 28000,
  priceInWords: "Twenty Eight Thousand Rupees",
  negotiable: "Yes",
  status: "Active",
};

const seededCoordinates = [
  { latitude: 27.6710, longitude: 85.3167, mapLabel: "Jawalakhel, Lalitpur" },
  { latitude: 27.6588, longitude: 85.4298, mapLabel: "Suryabinayak, Bhaktapur" },
  { latitude: 27.7172, longitude: 85.3240, mapLabel: "Lazimpat, Kathmandu" },
  { latitude: 27.6947, longitude: 85.3422, mapLabel: "Baneshwor, Kathmandu" },
  { latitude: 27.7351, longitude: 85.3303, mapLabel: "Maharajgunj, Kathmandu" },
  { latitude: 27.7184, longitude: 85.3110, mapLabel: "Kalanki, Kathmandu" },
  { latitude: 27.7066, longitude: 85.3304, mapLabel: "New Baneshwor, Kathmandu" },
  { latitude: 27.7296, longitude: 85.3457, mapLabel: "Boudha, Kathmandu" },
  { latitude: 27.7449, longitude: 85.3361, mapLabel: "Chabahil, Kathmandu" },
  { latitude: 27.7570, longitude: 85.3616, mapLabel: "Kapan, Kathmandu" },
];

const normalizeProperty = (property, userId, index) => {
  const normalizedType =
    property.propertyType === "Commercial Space" ? "Commercial" : property.propertyType;
  const coordinate = seededCoordinates[index] || seededCoordinates[seededCoordinates.length - 1];

  return {
    ...property,
    propertyType: normalizedType,
    userId,
    location: {
      ...coordinate,
      googleMapsUrl: `https://www.google.com/maps?q=${coordinate.latitude},${coordinate.longitude}`,
    },
  };
};

const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullname = process.env.ADMIN_FULLNAME || "RentEase Admin";

  if (!email || !password) {
    return null;
  }

  const existingAdmin = await adminModel.findOne({ email });
  if (existingAdmin) {
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return adminModel.create({
    fullname,
    email,
    password: hashedPassword,
  });
};

const ensureDemoLandlord = async () => {
  const email = process.env.SEED_LANDLORD_EMAIL || "landlord@rentease.com";
  const password = process.env.SEED_LANDLORD_PASSWORD || "Landlord@123";
  const fullname = process.env.SEED_LANDLORD_NAME || "RentEase Landlord";
  const phoneNumber = Number(process.env.SEED_LANDLORD_PHONE || "9800000001");

  let user = await userModel.findOne({ email });
  if (user) {
    return user;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user = await userModel.create({
    fullname,
    phoneNumber,
    email,
    password: hashedPassword,
    isVerified: true,
    profileImage: `https://avatar.iran.liara.run/username?username=${encodeURIComponent(fullname)}`,
    roles: ["tenant", "landlord"],
    currentRole: "landlord",
  });

  return user;
};

const ensureSeedProperties = async (ownerId) => {
  const existingCount = await propertyModel.countDocuments({});
  if (existingCount >= 10) {
    return existingCount;
  }

  await propertyModel.deleteMany({});

  const normalized = [...propertyData, fallbackProperty]
    .slice(0, 10)
    .map((property, index) => normalizeProperty(property, ownerId, index));

  await propertyModel.insertMany(normalized);
  return normalized.length;
};

const bootstrapData = async () => {
  const [admin, landlord] = await Promise.all([ensureAdmin(), ensureDemoLandlord()]);
  const propertyCount = landlord ? await ensureSeedProperties(landlord._id) : 0;

  return {
    adminEmail: admin?.email,
    landlordEmail: landlord?.email,
    propertyCount,
  };
};

module.exports = { bootstrapData };
