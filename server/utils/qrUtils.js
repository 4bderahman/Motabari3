import crypto from "crypto";

// Create a 32-byte key
function getEncryptionKey() {
  // Use a fixed string that's exactly 32 bytes (32 characters)
  const key = "12345678901234567890123456789012";
  return Buffer.from(key);
}

const ENCRYPTION_KEY = getEncryptionKey();
const IV_LENGTH = 16;

export function encryptData(data) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

    const jsonString = JSON.stringify(data);
    let encrypted = cipher.update(jsonString, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed: " + error.message);
  }
}

export function decryptData(text) {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed: " + error.message);
  }
}

export function generateQRCode() {
  return crypto.randomBytes(16).toString("hex");
}
