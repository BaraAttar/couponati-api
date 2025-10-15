import type { Request, Response } from "express";
import { verifyGoogleToken } from '../../services/google.service.js';
import jwt from "jsonwebtoken";
import { User } from '../../models/User.model.js';

export const googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ error: 'No idToken provided' });

    try {
        const payload = await verifyGoogleToken(idToken);
        if (!payload || !payload.sub) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload'
            });
        }

        // console.log(payload)
        const googleId = payload.sub;
        const email = payload.email;
        const firstName = payload.given_name;
        const lastName = payload.family_name;
        const picture = payload.picture;
        if (!email) return res.status(400).json({ success: false, message: "Email not provided by Google" });

        // findOrCreate
        const user = await User.findOneAndUpdate(
            { googleId },
            {
                googleId,
                email,
                firstName,
                lastName,
                picture
            },
            { new: true, upsert: true }
        ).populate({
            path: 'favourites',
            populate: { path: 'coupons' }
        });


        const token = jwt.sign(
            { googleId, email, firstName, lastName, picture },
            process.env.JWT_SECRET as string,
            { expiresIn: "1000d" }
        );

        return res.status(200).json({
            success: true,
            message: "google logged in successfuly",
            data: {
                token,
                user: {
                    googleId: user.googleId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    picture: user.picture,
                },
                favourites: user.favourites
            }
        })
    } catch (err) {
        console.error('googleLogin error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// TODO:
export const verifyToken = async (req: Request, res: Response) => {
    const tokenUser = req.user;
    if (!tokenUser) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: user payload required"
        })
    }
    try {
        const dbUser = await User.findOne({ googleId: tokenUser.googleId })
            .populate({
                path: 'favourites',
                populate: { path: 'coupons' }
            });

        if (!dbUser) {
            return res.status(404).json({
                success: false,
                message: "User not found in database"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: {
                user: {
                    googleId: dbUser.googleId,
                    email: dbUser.email,
                    firstName: dbUser.firstName,
                    lastName: dbUser.lastName,
                    picture: dbUser.picture
                },
                favourites: dbUser.favourites
            }
        });
    } catch (err) {
        console.error('verifyToken error:', err);
        return res.status(500).json({ success: false, message: "Database error" });
    }
}