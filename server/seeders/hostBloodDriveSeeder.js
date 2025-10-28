import HostBloodDrive from "../models/hostBloodDrive.js";
import { faker } from "@faker-js/faker";

const moroccanMaleNames = [
    "Abbas", "Abdel", "Abdellah", "Adam", "Adil", "Ahmed", "Ali", "Amine", "Anas", "Aryn",
    "Ayoub", "Beni", "Bilal", "Brahim", "Driss", "Emir", "Hachim", "Hamza", "Hassan", "Idrissa",
    "Ilyass", "Ismail", "Issam", "Jamal", "Kadin", "Kareem", "Khalid", "Maleek", "Marrakech",
    "Mehdi", "Mohamed", "Moroccan", "Morocco", "Mustafa", "Nabil", "Nadim", "Omar", "Osman",
    "Rachid", "Rafiq", "Rahim", "Rayan", "Said", "Sami", "Sulaiman", "Tangier", "Youness",
    "Yousef", "Zakaria", "Aamir"
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


const seedHostBloodDrive = async () => {
    try {
        await HostBloodDrive.deleteMany();
        console.log("HostBloodDrive records deleted");

        const hostBloodDriveRecords = [];
        const recordCount = Math.floor(Math.random() * 51) + 100; // 100-150 records

        for (let i = 0; i < recordCount; i++) {
            const name = moroccanMaleNames[Math.floor(Math.random() * moroccanMaleNames.length)];
            const city = moroccanCities[Math.floor(Math.random() * moroccanCities.length)];
            hostBloodDriveRecords.push({
                name: name,
                phone: faker.phone.number(),
                email: faker.internet.email({firstName: name}),
                institute: faker.company.name(),
                designation: faker.person.jobTitle(),
                city: city,
                done: faker.datatype.boolean(),
                message: faker.lorem.sentence(),
            });
        }

        await HostBloodDrive.insertMany(hostBloodDriveRecords);
        console.log("HostBloodDrive records seeded");
    } catch (error) {
        console.error("Error seeding HostBloodDrive records:", error);
        process.exit(1);
    }
};

export default seedHostBloodDrive; 