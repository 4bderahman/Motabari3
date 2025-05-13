import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Need Help schema and model
const NeedHelpSchema = new Schema({
	name: { type: String, required: true },
	phone: { type: String, required: true },
	email: { type: String, required: true },
	reason: { type: String, required: false },
	answered: { type: Boolean, default: false },
	message: { type: String },
}, { timestamps: true });
const NeedHelp = model("NeedHelp", NeedHelpSchema);

export default NeedHelp;
