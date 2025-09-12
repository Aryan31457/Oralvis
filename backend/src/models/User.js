import mongoose from "mongoose";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Other']
    },
    dob: {
        type: Date
    },
    nationality: {
        type: String,
        default: 'Indian'
    },
    contactNumber: {
        type: String
    },
    address: {
        type: String
    },
    memberAssociation: {
        type: String
    },
    isverified: {
        type: Boolean,
        default: false
    },
    verificationcode: String,
    verificationCodeExpiresAt: {
        type: Date
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const saltRounds = 5;
        const hashed = await bcrypt.hash(this.password, saltRounds);
        this.password = hashed;
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', UserSchema);
export default User;