import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface Admin extends Document {
    _id: Types.ObjectId;
    userName: string;
    password: string;
    role: 'user' | 'admin';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<Admin>(
    {
        userName: {
            type: String,
            trim: true,
            minlength: [5, 'User name must be at least 5 character long'],
            maxlength: [30, 'User name cannot exceed 30 characters']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: 'Role must be user or admin'
            },
            default: 'user',
        },
    },
    { timestamps: true }
);

// تشفير كلمة المرور قبل الحفظ
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// دالة لمقارنة كلمة المرور
adminSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const Admin = model<Admin>('Admin', adminSchema);