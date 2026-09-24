'use server';

import { auth } from '@/lib/auth/server';
import { getLogger } from '@logtape/logtape';
import { redirect } from 'next/navigation';

export async function signInWithEmail(_prevState: { error: string } | null, formData: FormData) {
    const logger = getLogger(['ms-engineering-logs', 'auth-login']);

    const { error } = await auth.signIn.email({
        email: formData.get('email') as string,
        password: formData.get('password') as string
    });

    if (error) {
        logger.error(error.message || 'Sign in failed.');
        return { error: error.message || 'Failed to sign in. Try again.' }
    }

    redirect('/admin');
}