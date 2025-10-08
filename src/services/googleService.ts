import { OAuth2Client, type TokenPayload } from 'google-auth-library';

const client = new OAuth2Client();

export async function verifyGoogleToken(idToken: string): Promise<TokenPayload | undefined> {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: [process.env.GOOGLE_CLIENT_ID].toString()

    });
    return ticket.getPayload() || undefined;
}


