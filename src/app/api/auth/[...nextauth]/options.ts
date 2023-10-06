/* cspell:disable */

import { AuthOptions } from 'next-auth';
import Twitter from 'next-auth/providers/twitter';
import Github from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
    debug: process.env.NODE_ENV === 'development',
    providers: [
        Github({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Twitter({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            version: '2.0',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: Record<'username' | 'password', string> | undefined) {
                const user = { id: '1', name: 'jsmith', email: 'smith@jsmith.com' };

                if (credentials?.username === user.name && credentials?.password === 'password') {
                    return user;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user, account, profile, trigger, session }) => {
            console.log('DEBUG: jwt');
            console.log({
                token,
                user,
                account,
                profile,
                session,
                trigger,
            });

            if (account) {
                session.accessToken = account.accessToken;
            }
            return token;
        },
    },
} satisfies AuthOptions;
