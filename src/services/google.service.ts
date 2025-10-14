import { OAuth2Client, type TokenPayload } from 'google-auth-library';

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID!;
const ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID!;
const IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID!;

if (!WEB_CLIENT_ID || !ANDROID_CLIENT_ID || !IOS_CLIENT_ID) {
    throw new Error("FATAL ERROR: GOOGLE_CLIENT_ID is not defined in environment variables");
}

const client = new OAuth2Client();

export async function verifyGoogleToken(idToken: string): Promise<TokenPayload | undefined> {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: [WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID]

    });
    return ticket.getPayload() || undefined;
}


