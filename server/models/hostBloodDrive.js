import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Host Blood Drive schema and model
const HostBloodDriveSchema = new Schema({
	name: { type: String, required: true },
	phone: { type: String, required: true },
	email: { type: String, required: true },
	institute: { type: String, required: true },
	designation: { type: String, required: true },
	city: { type: String, required: true },
	done: { type: Boolean, default: false },
	message: { type: String },
}, { timestamps: true });
const HostBloodDrive = model("HostBloodDrive", HostBloodDriveSchema);

export default HostBloodDrive;
