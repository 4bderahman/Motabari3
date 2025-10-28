import NeedHelp from "../models/needHelp.js";
import { faker } from "@faker-js/faker";

const moroccanMaleNames = [
    "Abbas", "Abdel", "Abdellah", "Adam", "Adil", "Ahmed", "Ali", "Amine", "Anas", "Aryn",
    "Ayoub", "Beni", "Bilal", "Brahim", "Driss", "Emir", "Hachim", "Hamza", "Hassan", "Idrissa",
    "Ilyass", "Ismail", "Issam", "Jamal", "Kadin", "Kareem", "Khalid", "Maleek", "Marrakech",
    "Mehdi", "Mohamed", "Moroccan", "Morocco", "Mustafa", "Nabil", "Nadim", "Omar", "Osman",
    "Rachid", "Rafiq", "Rahim", "Rayan", "Said", "Sami", "Sulaiman", "Tangier", "Youness",
    "Yousef", "Zakaria", "Aamir"
];

const seedNeedHelp = async () => {
    try {
        await NeedHelp.deleteMany();
        console.log("NeedHelp records deleted");

        const needHelpRecords = [];
        const recordCount = Math.floor(Math.random() * 51) + 100; // 100-150 records

        for (let i = 0; i < recordCount; i++) {
            const name = moroccanMaleNames[Math.floor(Math.random() * moroccanMaleNames.length)];
            needHelpRecords.push({
                name: name,
                phone: faker.phone.number(),
                email: faker.internet.email({firstName: name}),
                reason: faker.lorem.words(),
                answered: faker.datatype.boolean(),
                message: faker.lorem.sentence(),
            });
        }

        await NeedHelp.insertMany(needHelpRecords);
        console.log("NeedHelp records seeded");
    } catch (error) {
        console.error("Error seeding NeedHelp records:", error);
        process.exit(1);
    }
};

export default seedNeedHelp; 