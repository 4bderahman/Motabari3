import mongoose from "mongoose";
import dotenv from "dotenv";
import BloodBank from "../models/bloodBank.js";

dotenv.config();

const initialData = [
  // Casablanca (6)
  {
    name: "Casablanca Centre Blood Services",
    address: "387 Boulevard Mohammed V",
    city: "Casablanca",
    phone: "+212-522-345678",
    email: "casa@Motabari3.ma",
    latitude: 33.593494,
    longitude: -7.599751,
    availableBloodTypes: ["A+", "B+", "O+", "O-"],
  },
  {
    name: "Casablanca Ibn Tofail Blood Center",
    address: "22 Hassan II Avenue",
    city: "Casablanca",
    phone: "+212-522-567890",
    email: "casablanca2@Motabari3.ma",
    latitude: 33.586212,
    longitude: -7.622377,
    availableBloodTypes: ["A+", "AB+", "AB-", "O+"],
  },
  {
    name: "Casablanca Anfa Blood Bank",
    address: "12 Boulevard d'Anfa",
    city: "Casablanca",
    phone: "+212-522-112233",
    email: "casablanca3@Motabari3.ma",
    latitude: 33.592893,
    longitude: -7.632754,
    availableBloodTypes: ["O+", "B-", "A-", "AB-"],
  },
  {
    name: "Casablanca Marina Blood Center",
    address: "36 Boulevard de Tiznit",
    city: "Casablanca",
    phone: "+212-522-445566",
    email: "casablanca4@Motabari3.ma",
    latitude:  33.60432,
    longitude: -7.633055,
    availableBloodTypes: ["A+", "O-", "B+", "AB+"],
  },
  {
    name: "Casablanca Lyautey Blood Center",
    address: "260 Boulevard Ziraoui",
    city: "Casablanca",
    phone: "+212-522-778899",
    email: "casablanca5@Motabari3.ma",
    latitude: 33.595091,
    longitude: -7.633375,
    availableBloodTypes: ["A-", "O-", "B+", "AB+"],
  },
  {
    name: "Casablanca Emergency Blood Center",
    address: "33 Boulevard Rachidi",
    city: "Casablanca",
    phone: "+212-522-990011",
    email: "casablanca6@Motabari3.ma",
    latitude: 33.59223,
    longitude: -7.624232,
    availableBloodTypes: ["O+", "A+", "B+", "AB-"],
  },

  // Marrakech (7 entries)
  {
    name: "Central Blood Bank Marrakech",
    address: "123 Rue El Imam Malik",
    city: "Marrakech",
    phone: "+212-524-123456",
    email: "central@Motabari3.ma",
    latitude: 31.632323,
    longitude: -8.009655,
    availableBloodTypes: ["A+", "B+", "O+", "AB+"],
  },
  {
    name: "Marrakech Regional Blood Center",
    address: "15 Boulevard Mohammed VI",
    city: "Marrakech",
    phone: "+212-524-654321",
    email: "marrakech2@Motabari3.ma",
    latitude: 31.62354,
    longitude:  -8.011314,
    availableBloodTypes: ["A+", "O-", "B-", "AB-"],
  },
  {
    name: "Marrakech Blood Donation Unit",
    address: "89 Boulevard Allal El Fassi",
    city: "Marrakech",
    phone: "+212-524-111222",
    email: "marrakech3@Motabari3.ma",
    latitude: 31.667178,
    longitude: -8.01067,
    availableBloodTypes: ["A+", "B+", "O+", "O-"],
  },
  {
    name: "Marrakech Airport Blood Center",
    address: "42 Avenue Guemassa",
    city: "Marrakech",
    phone: "+212-524-333444",
    email: "marrakech4@Motabari3.ma",
    latitude:  31.595631,
    longitude:  -8.027814,
    availableBloodTypes: ["A+", "B-", "AB-", "O+"],
  },
  {
    name: "Marrakech Blood Care Center",
    address: "58 Boulevard Zerktouni",
    city: "Marrakech",
    phone: "+212-524-555666",
    email: "marrakech5@Motabari3.ma",
    latitude: 31.628553,
    longitude:  -8.056966,
    availableBloodTypes: ["O-", "AB+", "A+", "B+"],
  },
  {
    name: "Charaf Blood Center Marrakech",
    address: "25 Avenue Gueliz",
    city: "Marrakech",
    phone: "+212-524-777888",
    email: "marrakech6@Motabari3.ma",
    latitude: 31.678072,
    longitude: -8.026018,
    availableBloodTypes: ["A+", "B+", "O+", "AB+"],
  },
  

  // Rabat (6 entries)
  {
    name: "Rabat Regional Blood Center",
    address: "45 Hassan II Avenue",
    city: "Rabat",
    phone: "+212-537-789012",
    email: "rabat@Motabari3.ma",
    latitude: 34.023808,
    longitude: -6.834719,
    availableBloodTypes: ["B+", "O+"],
  },
  {
    name: "Emergency Blood Bank Rabat",
    address: "74 Rue Boured",
    city: "Rabat",
    phone: "+212-537-999000",
    email: "rabat7@Motabari3.ma",
    latitude: 34.02547,
    longitude: -6.825611,
    availableBloodTypes: ["A+", "A-", "O-", "AB+"],
  },
  {
    name: "Rabat Central Blood Bank",
    address: "99 Rue Abou Hamed Al Ghazali",
    city: "Rabat",
    phone: "+212-537-999999",
    email: "rabat2@Motabari3.ma",
    latitude: 33.980801,
    longitude: -6.893955,
    availableBloodTypes: ["B-", "AB-", "AB+"],
  },
  {
    name: "Rabat Souissi Blood Donation Center",
    address: "50 Avenue Laalou",
    city: "Rabat",
    phone: "+212-537-333444",
    email: "rabat3@Motabari3.ma",
    latitude: 34.027787,
    longitude: -6.840687,
    availableBloodTypes: ["A+", "B+", "O-", "AB+"],
  },
  {
    name: "Kénitra Emergency Blood Bank",
    address: "20 Avenue Balima",
    city: "Kénitra",
    phone: "+212-537-777888",
    email: "Kenitra@Motabari3.ma",
    latitude: 34.25581,
    longitude: -6.62224,
    availableBloodTypes: ["A-", "B-", "O-", "AB-"],
  },
  {
    name: "Rabat Blood Care Center",
    address: "75 Rue des Oudaïas",
    city: "Rabat",
    phone: "+212-537-888999",
    email: "rabat5@Motabari3.ma",
    latitude: 34.029151,
    longitude: -6.83509,
    availableBloodTypes: ["O+", "AB-", "A-", "B+"],
  },

  // Tanger (6 entries)
  {
    name: "Tanger Blood Donation Center",
    address: "12 Boulevard Pasteur",
    city: "Tanger",
    phone: "+212-539-111222",
    email: "tanger@Motabari3.ma",
    latitude: 35.779854,
    longitude: -5.809003,
    availableBloodTypes: ["A+", "O+", "B+"],
  },
  {
    name: "Tanger Moulay Youssef Blood Services",
    address: "5 Boulevard Moulay Youssef",
    city: "Tanger",
    phone: "+212-539-222333",
    email: "tanger2@Motabari3.ma",
    latitude: 35.770349,
    longitude: -5.804253,
    availableBloodTypes: ["A-", "AB-"],
  },
  {
    name: "Tanger Dar Dbagh Blood Services",
    address: "5 Rue Dar Dbagh",
    city: "Tanger",
    phone: "+212-539-222333",
    email: "tanger3@Motabari3.ma",
    latitude: 35.785814,
    longitude: -5.80891,
    availableBloodTypes: ["A-", "AB-"],
  },
  {
    name: "Tanger Emergency Blood Services",
    address: "Boulevard Moulay Soulayman",
    city: "Tanger",
    phone: "+212-539-222333",
    email: "tanger4@Motabari3.ma",
    latitude: 35.754668,
    longitude: -5.810451,
    availableBloodTypes: ["A-", "AB-"],
  },
  {
    name: "Tanger Moulay Rachid Blood Services",
    address: "Boulevard Moulay Rachid",
    city: "Tanger",
    phone: "+212-539-222333",
    email: "tanger5@Motabari3.ma",
    latitude: 35.752728,
    longitude: -5.851187,
    availableBloodTypes: ["A-", "AB-"],
  },
  {
    name: "Tanger Mohammed VI Blood Services",
    address: "5 Avenue Mohammed VI",
    city: "Tanger",
    phone: "+212-539-222333",
    email: "tanger6@Motabari3.ma",
    latitude: 35.77612,
    longitude: -5.777837,
    availableBloodTypes: ["A-", "AB-"],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      dbName: "hemocelldb",
    });

    // Clear existing data
    await BloodBank.deleteMany({});

    // Insert new data
    await BloodBank.insertMany(initialData);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();