import { NewUsers } from "../models/newUsers.js";
import { faker } from "@faker-js/faker";

const moroccanMaleNames = [
  "Abbas", "Abdel", "Abdellah", "Adam", "Adil", "Ahmed", "Ali", "Amine", "Anas", "Aryn",
  "Ayoub", "Beni", "Bilal", "Brahim", "Driss", "Emir", "Hachim", "Hamza", "Hassan", "Idrissa",
  "Ilyass", "Ismail", "Issam", "Jamal", "Kadin", "Kareem", "Khalid", "Maleek", "Marrakech",
  "Mehdi", "Mohamed", "Moroccan", "Morocco", "Mustafa", "Nabil", "Nadim", "Omar", "Osman",
  "Rachid", "Rafiq", "Rahim", "Rayan", "Said", "Sami", "Sulaiman", "Tangier", "Youness",
  "Yousef", "Zakaria", "Aamir"
];

const moroccanFemaleNames = [
  "Adilah", "Aicha", "Aleah", "Amina", "Amira", "Anisah", "Asmaa", "Ayat", "Aziza", "Buchra",
  "Chaima", "Faiza", "Farah", "Farida", "Fatiha", "Fatima", "Habiba", "Hadiya", "Ikram", "Imane",
  "Ines", "Jamila", "Jasmin", "Khadija", "Khalida", "Latifah", "Layla", "Maria", "Meryem", "Nadia",
  "Nahla", "Naima", "Nora", "Nour", "Rabia", "Rachida", "Rehana", "Sabrina", "Saeeda", "Safaa",
  "Salima", "Salma", "Samira", "Sarah", "Sophia", "Soraya", "Yasmine", "Zara", "Zaynab", "Zohra"
];

const moroccanCities = [
    "Casablanca", "Rabat", "Fes", "Sale", "Marrakesh", "Agadir", "Tangier", "Meknes",
    "Oujda-Angad", "Al Hoceima", "Kenitra", "Tetouan", "Temara", "Safi", "Mohammedia",
    "Khouribga", "Beni Mellal", "El Jadid", "Taza", "Nador", "Settat", "Larache",
    "Ksar El Kebir", "Khemisset", "Guelmim", "Berrechid", "Errachidia", "Oued Zem",
    "Al Fqih Ben Calah", "Taourirt", "Berkane", "Sidi Slimane", "Sidi Qacem", "Khenifra",
    "Ifrane", "Taroudant", "Essaouira", "Tiflet", "Oulad Teima", "Sefrou", "Youssoufia",
    "Tan-Tan", "Ouezzane", "Guercif", "Ouarzazat", "Tirhanimine", "Dakhla", "Tiznit",
    "Fnidek", "Azrou", "Midelt", "Skhirate", "Souq Larb'a al Gharb", "Jerada", "Smara",
    "Kasba Tadla", "Sidi Bennour", "Imzouren", "Martil", "Azemmour", "Tinghir",

];

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const seedUsers = async () => {
  try {
    await NewUsers.deleteMany();
    console.log("Users deleted");

    const users = [];
    const password = "$2b$10$/6Efmc2Cm3ttabpfYXRize5nzmDOnJDbGeTJ/4Xt3DEZiUgDDhvAq";
    const donorCount = Math.floor(Math.random() * 26) + 50; // 50-75 donors
    const hospitalCount = Math.floor(Math.random() * 26) + 50; // 50-75 hospitals
    
    // Create donors
    for (let i = 0; i < donorCount; i++) {
        const name = moroccanMaleNames[Math.floor(Math.random() * moroccanMaleNames.length)];
      users.push({
        name: name,
        email: faker.internet.email({firstName: name}),
        phone: faker.phone.number(),
        password: password,
        userType: "donor",
        source: "donor",
        age: faker.number.int({ min: 18, max: 60 }),
        bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        checked: 1,
        donationHistory: [],
        donations: [],
      });
    }

    // Create hospitals
    for (let i = 0; i < hospitalCount; i++) {
        const city = moroccanCities[Math.floor(Math.random() * moroccanCities.length)];
        const hospitalName = `Hopital ${city}`;
        const contactPerson = moroccanFemaleNames[Math.floor(Math.random() * moroccanFemaleNames.length)];
      users.push({
        name: hospitalName,
        email: faker.internet.email({firstName: hospitalName.replace(" ", "")}),
        phone: faker.phone.number(),
        password: password,
        userType: "hospital",
        source: "hospital",
        address: `${faker.location.streetAddress()}, ${city}, Morocco`,
        contactPerson: contactPerson,
        checked: 1,
      });
    }

    await NewUsers.insertMany(users);
    console.log("Users seeded");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

export default seedUsers; 