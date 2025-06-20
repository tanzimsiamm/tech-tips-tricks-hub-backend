import { Schema, model, Types } from "mongoose";
import { IPostDocument, TPost,  } from "./post.interface";

const postSchema = new Schema<IPostDocument>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
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
    comments: [ // Embedded comments
        {
            user: { // User who made the comment
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true,
            },
            createdAt: { // Timestamp for each comment
                type: Date,
                default: Date.now,
            },
        },
    ],
    views: {
        type: Number,
        default: 0,
    },
    images: [{ // URLs of images attached to the post
        type: String,
    }],
}, {
    timestamps: true, // Adds createdAt and updatedAt for the post itself
});

// Indexes for better query performance
postSchema.index({ category: 1 }); // Index for category filtering
postSchema.index({ title: 'text', content: 'text' }); // Text index for full-text search on title and content

export const Post = model<IPostDocument>('Post', postSchema);