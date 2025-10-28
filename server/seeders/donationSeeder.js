import { Donation } from "../models/Donation.js";
import { NewUsers } from "../models/newUsers.js";
import { faker } from "@faker-js/faker";

const statuses = ["not_yet", "donated"];

const seedDonations = async () => {
    try {
        await Donation.deleteMany();
        console.log("Donations deleted");

        const donors = await NewUsers.find({ userType: "donor" });
        if (donors.length === 0) {
            console.log("No donors found to create donations.");
            return;
        }

        const donations = [];
        const donationCount = Math.floor(Math.random() * 51) + 100; // 100-150 donations

        for (let i = 0; i < donationCount; i++) {
            const randomDonor = donors[Math.floor(Math.random() * donors.length)];

            donations.push({
                donorId: randomDonor._id,
                name: randomDonor.name,
                email: randomDonor.email,
                phone: randomDonor.phone,
                bloodType: randomDonor.bloodType,
                date: faker.date.past(),
                units: 450,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                message: faker.lorem.sentence(),
            });
        }

        await Donation.insertMany(donations);
        console.log("Donations seeded");
    } catch (error) {
        console.error("Error seeding donations:", error);
        process.exit(1);
    }
};

export default seedDonations; 