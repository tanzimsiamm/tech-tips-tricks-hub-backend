import { Schema, model, Types } from "mongoose";
import { IPostDocument, TPost } from "./post.interface";

const postSchema = new Schema<IPostDocument>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Web', 'Software Engineering', 'AI', 'Mobile', 'Cybersecurity', 'Data Science', 'Other'],
        default: 'Other',
    },
    tags: [{
        type: String,
    }],
    isPremium: {
        type: Boolean,
        default: false,
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    downvotes: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    views: {
        type: Number,
        default: 0,
    },
    images: [{
        type: String,
    }],
}, {
    timestamps: true,
});

postSchema.index({ category: 1 });
postSchema.index({ title: 'text', content: 'text' });

export const Post = model<IPostDocument>('Post', postSchema);