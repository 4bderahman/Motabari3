import { BloodRequest } from "../models/bloodRequest.js";
import { NewUsers } from "../models/newUsers.js";
import { faker } from "@faker-js/faker";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencies = ["normal", "urgent", "critical"];
const statuses = ["pending", "approved", "rejected"];

const seedBloodRequests = async () => {
    try {
        await BloodRequest.deleteMany();
        console.log("Blood requests deleted");

        const hospitals = await NewUsers.find({ userType: "hospital" });
        if (hospitals.length === 0) {
            console.log("No hospitals found to create blood requests.");
            return;
        }

        const bloodRequests = [];
        const requestCount = Math.floor(Math.random() * 51) + 100; // 100-150 requests

        for (let i = 0; i < requestCount; i++) {
            const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];

            bloodRequests.push({
                hospitalId: randomHospital._id,
                hospitalName: randomHospital.name,
                bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
                units: faker.number.int({ min: 1, max: 10 }),
                urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
            });
        }

        await BloodRequest.insertMany(bloodRequests);
        console.log("Blood requests seeded");
    } catch (error) {
        console.error("Error seeding blood requests:", error);
        process.exit(1);
    }
};

export default seedBloodRequests; 