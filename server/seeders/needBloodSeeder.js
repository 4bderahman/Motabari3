import NeedBlood from "../models/needBlood.js";
import { NewUsers } from "../models/newUsers.js";
import { faker } from "@faker-js/faker";

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
const urgencies = ["normal", "urgent", "critical"];
const statuses = ["pending", "fulfilled", "cancelled"];

const seedNeedBlood = async () => {
    try {
        await NeedBlood.deleteMany();
        console.log("NeedBlood requests deleted");

        const donors = await NewUsers.find({ userType: "donor" });
        if (donors.length === 0) {
            console.log("No donors found to create NeedBlood requests.");
            return;
        }

        const needBloodRequests = [];
        const requestCount = Math.floor(Math.random() * 51) + 100; // 100-150 requests

        for (let i = 0; i < requestCount; i++) {
            const randomDonor = donors[Math.floor(Math.random() * donors.length)];
            const randomPatient = donors[Math.floor(Math.random() * donors.length)];
            const city = moroccanCities[Math.floor(Math.random() * moroccanCities.length)];

            needBloodRequests.push({
                userId: randomDonor._id,
                patientName: randomPatient.name,
                bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
                units: faker.number.int({ min: 1, max: 5 }),
                urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
                hospital: `Hopital ${city}`,
                location: city,
                contactNumber: faker.phone.number(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                notes: faker.lorem.sentence(),
            });
        }

        await NeedBlood.insertMany(needBloodRequests);
        console.log("NeedBlood requests seeded");
    } catch (error) {
        console.error("Error seeding NeedBlood requests:", error);
        process.exit(1);
    }
};

export default seedNeedBlood; 