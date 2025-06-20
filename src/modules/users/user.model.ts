import { Schema, model, Types } from "mongoose";
import { TUserBase, IUserDocument } from "./user.interface";
import bcrypt from 'bcryptjs';

const userSchema = new Schema<IUserDocument>({
    name: {
        type: String,
        required: true,
    },
    email : {
        type : String,
        required : true,
        unique: true,
    },
    role : {
        type : String,
        required : true,
        enum : ['user','admin']
    },
    password : {
        type : String,
        required : true,
        select: false,
    },
    followers: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    following: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    memberShip: {
        type: { // Define sub-schema for TMembership
            takenDate: { type: Date, required: true }, // Changed to Date
            exp: { type: Date, required: true },       // Changed to Date
            package: { type: Schema.Types.Mixed, required: true } // Mixed for object
        },
        default: null
    },
    image : {
        type : String,
        required : true,
    },
    coverImg : {
        type : String,
    },
    isBlocked : {
        type : Boolean,
        default : false,
    }
}, { timestamps : true });

userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export const User = model <IUserDocument> ('User', userSchema);