import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,select:false },
    fullName: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    },
    role: { type: String, enum: ['user', 'seller'], default: 'user' },
    addresses: [addressSchema]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;