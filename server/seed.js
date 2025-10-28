import mongoose from "mongoose";
import dotenv from "dotenv";
import seedUsers from "./seeders/userSeeder.js";
import seedNeedBlood from "./seeders/needBloodSeeder.js";
import seedBloodRequests from "./seeders/bloodRequestSeeder.js";
import seedDonateBlood from "./seeders/donateBloodSeeder.js";
import seedDonations from "./seeders/donationSeeder.js";
import seedNeedHelp from "./seeders/needHelpSeeder.js";
import seedHostBloodDrive from "./seeders/hostBloodDriveSeeder.js";
import seedQRCodes from "./seeders/qrCodeSeeder.js";

dotenv.config();

const connectionString = `${process.env.CONNECTION_STRING}`;

const seedDatabase = async () => {
    try {
        await mongoose.connect(connectionString, { dbName: "hemocelldb" });
        console.log("MongoDB Connected for seeding...");

        await seedUsers();
        await Promise.all([
            seedNeedBlood(),
            seedBloodRequests(),
            seedDonateBlood(),
            seedDonations(),
            seedNeedHelp(),
            seedHostBloodDrive(),
            seedQRCodes(),
        ]);

        console.log("Database seeded successfully");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
};

seedDatabase(); 