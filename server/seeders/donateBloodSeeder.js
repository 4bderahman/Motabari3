import DonateBlood from "../models/donateBlood.js";
import { NewUsers } from "../models/newUsers.js";
import { faker } from "@faker-js/faker";

const seedDonateBlood = async () => {
    try {
        await DonateBlood.deleteMany();
        console.log("DonateBlood records deleted");

        const donors = await NewUsers.find({ userType: "donor" });
        if (donors.length === 0) {
            console.log("No donors found to create DonateBlood records.");
            return;
        }

        const donateBloodRecords = [];
        const recordCount = Math.floor(Math.random() * 51) + 100; // 100-150 records

        for (let i = 0; i < recordCount; i++) {
            const randomDonor = donors[Math.floor(Math.random() * donors.length)];

            donateBloodRecords.push({
                name: randomDonor.name,
                email: randomDonor.email,
                phone: randomDonor.phone,
                bloodType: randomDonor.bloodType,
                message: faker.lorem.sentence(),
                donated: faker.datatype.boolean(),
                donorId: randomDonor._id,
                date: faker.date.past(),
            });
        }

        await DonateBlood.insertMany(donateBloodRecords);
        console.log("DonateBlood records seeded");
    } catch (error) {
        console.error("Error seeding DonateBlood records:", error);
        process.exit(1);
    }
};

export default seedDonateBlood; 