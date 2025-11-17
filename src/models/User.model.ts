import { Schema, model, Document, Types } from 'mongoose';

export interface User extends Document {
    _id: Types.ObjectId;
    googleId: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    picture?: String;
    gender?: 'male' | 'female' | 'other';
    favourites: Array<string | Types.ObjectId>;
    role: 'user';
}

const userSchema = new Schema<User>(
    {
        googleId: {
            type: String,
            required: [true, 'User must have a Google ID'],
            unique: true,
            index: true
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        },
        phone: {
            type: String,
            sparse: true,
            unique: true,
            match: [/^[+]?[1-9][\d\s\-\(\)]{7,15}$/, 'Please enter a valid phone number'],
        },
        firstName: {
            type: String,
            trim: true,
            minlength: [1, 'First name must be at least 1 character long'],
            maxlength: [30, 'First name cannot exceed 30 characters']
        },
        lastName: {
            type: String,
            trim: true,
            minlength: [1, 'Last name must be at least 1 character long'],
            maxlength: [30, 'Last name cannot exceed 30 characters']
        },
        picture: {
            type: String,
        },
        age: {
            type: Number,
            min: [13, 'Age must be at least 13 years old'],
            max: [120, 'Age cannot exceed 120 years']
        },
        gender: {
            type: String,
            enum: {
                values: ['male', 'female', 'other'],
                message: 'Gender must be male, female, or other'
            }
        },
        favourites: [{ type: Schema.Types.ObjectId, ref: 'Store' }],
        role: {
            type: String,
            enum: {
                values: ['user'],
                message: 'Role just can be user'
            },
            default: 'user',
            immutable: true,
        },
    },
    { timestamps: true }
);

export const User = model<User>('User', userSchema);