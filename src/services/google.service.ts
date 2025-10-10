import { OAuth2Client, type TokenPayload } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
    throw new Error("FATAL ERROR: GOOGLE_CLIENT_ID is not defined in environment variables");
}

const client = new OAuth2Client();

export async function verifyGoogleToken(idToken: string): Promise<TokenPayload | undefined> {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: [GOOGLE_CLIENT_ID].toString()

    });
    return ticket.getPayload() || undefined;
}


