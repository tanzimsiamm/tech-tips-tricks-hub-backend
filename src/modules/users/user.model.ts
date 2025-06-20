import { Schema, model, Types } from "mongoose";
import { TUser, IUserDocument } from "./user.interface";
import bcrypt from 'bcryptjs';

const userSchema = new Schema<IUserDocument>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin']
    },
    password: {
        type: String,
        required: true, // Password should be required for initial user creation
        select: false, // Don't return password by default on queries
    },
    followers: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    following: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    memberShip: {
        type: Schema.Types.Mixed, // Allows either 'null' or an object
        default: null
    },
    image: {
        type: String,
        required: true,
    },
    coverImg: {
        type: String,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10); // Using 10 rounds for salt
    }
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    if (!this.password) return false; // If password doesn't exist, cannot match
    return await bcrypt.compare(enteredPassword, this.password);
};


export const User = model<IUserDocument>('User', userSchema);