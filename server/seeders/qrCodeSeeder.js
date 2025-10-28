import { QRCode } from "../models/QRCode.js";
import { NewUsers } from "../models/newUsers.js";
import { faker } from "@faker-js/faker";

const seedQRCodes = async () => {
    try {
        await QRCode.deleteMany();
        console.log("QRCodes deleted");

        const donors = await NewUsers.find({ userType: "donor" });
        if (donors.length === 0) {
            console.log("No donors found to create QR codes.");
            return;
        }

        const qrCodes = [];
        const codeCount = Math.floor(Math.random() * 51) + 100; // 100-150 qr codes

        for (let i = 0; i < codeCount; i++) {
            const randomDonor = donors[Math.floor(Math.random() * donors.length)];

            qrCodes.push({
                code: faker.string.uuid(),
                donorId: randomDonor._id,
                data: faker.lorem.sentence(),
                expiry: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
            });
        }

        await QRCode.insertMany(qrCodes);
        console.log("QRCodes seeded");
    } catch (error) {
        console.error("Error seeding QR codes:", error);
        process.exit(1);
    }
};

export default seedQRCodes; 