import type { Request, Response } from "express";
import { verifyGoogleToken } from '../../services/google.service.js';
import jwt from "jsonwebtoken";
import { User } from '../../models/User.model.js';
import type { GoogleTokenInput } from "../../validations/user/user.auth.validation.js";

export const googleLogin = async (req: Request<{}, {}, GoogleTokenInput>, res: Response) => {
    const { idToken } = req.body
    const lang = req.language || 'en';
    if (!idToken) return res.status(400).json({ error: 'No idToken provided' });

    try {
        const payload = await verifyGoogleToken(idToken);
        if (!payload || !payload.sub) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload'
            });
        }

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
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate({
            path: 'favourites',
            populate: { path: 'coupons' }
        }).lean();

        user.favourites = (user.favourites as any[]).map((f: any) => ({
            ...f,
            name: f.name[lang],
            description: f.description[lang],
            coupons: (f.coupons as any[]).map((c: any) => ({
                ...c,
                description: c.description[lang],
            })),
        }));

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

export const verifyToken = async (req: Request, res: Response) => {
    const lang = req.language || 'en';
    const userToken = req.user;
    if (!userToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: user payload required"
        })
    }
    try {
        const user = await User.findOne({ googleId: userToken.googleId })
            .populate({
                path: 'favourites',
                populate: { path: 'coupons' }
            }).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found in database"
            });
        }

        user.favourites = (user.favourites as any[]).map((f: any) => ({
            ...f,
            name: f.name[lang],
            description: f.description[lang],
            coupons: (f.coupons as any[]).map((c: any) => ({
                ...c,
                description: c.description[lang],
            })),
        }));

        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: {
                user: {
                    googleId: user.googleId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    picture: user.picture
                },
                favourites: user.favourites
            }
        });
    } catch (err) {
        console.error('verifyToken error:', err);
        return res.status(500).json({ success: false, message: "Database error" });
    }
}