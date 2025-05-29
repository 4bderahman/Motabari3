// MongoDB initialization script for Motabari3 Blood Bank System

// Switch to the hemocelldb database
db = db.getSiblingDB('hemocelldb');

// Create collections with validation
db.createCollection("newusers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "phone", "password", "userType", "source"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        password: { bsonType: "string" },
        userType: { bsonType: "string", enum: ["donor", "hospital"] },
        source: { bsonType: "string" },
        age: { bsonType: "number" },
        bloodType: { bsonType: "string", enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
        address: { bsonType: "string" },
        contactPerson: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("donateblood", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "phone", "bloodType", "date"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        bloodType: { bsonType: "string", enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
        date: { bsonType: "date" },
        donated: { bsonType: "bool" },
        message: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("needbloods", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientName", "bloodType", "units", "hospital", "location", "contactNumber"],
      properties: {
        patientName: { bsonType: "string" },
        bloodType: { bsonType: "string", enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
        units: { bsonType: "number", minimum: 1 },
        urgency: { bsonType: "string", enum: ["normal", "urgent", "critical"] },
        hospital: { bsonType: "string" },
        location: { bsonType: "string" },
        contactNumber: { bsonType: "string" },
        status: { bsonType: "string", enum: ["pending", "fulfilled", "cancelled"] }
      }
    }
  }
});

db.createCollection("bloodrequests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["hospitalName", "bloodType", "units"],
      properties: {
        hospitalName: { bsonType: "string" },
        bloodType: { bsonType: "string", enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
        units: { bsonType: "number", minimum: 1 },
        urgency: { bsonType: "string", enum: ["normal", "urgent", "critical"] },
        status: { bsonType: "string", enum: ["pending", "approved", "rejected"] }
      }
    }
  }
});

db.createCollection("hostblooddrives");
db.createCollection("needhelps");
db.createCollection("bloodbanks");

// Create indexes for better performance
db.newusers.createIndex({ "email": 1 }, { unique: true });
db.newusers.createIndex({ "phone": 1 }, { unique: true });
db.newusers.createIndex({ "userType": 1 });

db.donateblood.createIndex({ "bloodType": 1 });
db.donateblood.createIndex({ "date": 1 });
db.donateblood.createIndex({ "donated": 1 });

db.needbloods.createIndex({ "bloodType": 1 });
db.needbloods.createIndex({ "urgency": 1 });
db.needbloods.createIndex({ "status": 1 });

db.bloodrequests.createIndex({ "bloodType": 1 });
db.bloodrequests.createIndex({ "urgency": 1 });
db.bloodrequests.createIndex({ "status": 1 });

// Insert sample data for testing
print("Inserting sample data...");

// Sample blood banks
db.bloodbanks.insertMany([
  {
    name: "Central Blood Bank",
    address: "123 Medical Center Drive",
    city: "Main City",
    phone: "+1234567890",
    email: "central@bloodbank.com",
    latitude: 40.7128,
    longitude: -74.0060,
    availableBloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Regional Blood Center",
    address: "456 Health Plaza",
    city: "Second City",
    phone: "+1234567891",
    email: "regional@bloodbank.com",
    latitude: 40.7589,
    longitude: -73.9851,
    availableBloodTypes: ["A+", "B+", "O+", "AB+"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("MongoDB initialization completed successfully!");