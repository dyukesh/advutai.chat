import type { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from './prisma';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER_URL ?? '',
      from: process.env.EMAIL_FROM ?? '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET ?? '',
  callbacks: {
    session: async ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id },
    }),
  },
};
