import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MountainIcon } from 'lucide-react';
import { Suspense } from 'react';

export default function AdminLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  async function login(formData: FormData) {
    'use server';

    const password = formData.get('password') as string;
    // In a real app, you'd use a service like NextAuth.js or another auth provider
    // and compare hashed passwords.
    if (password === process.env.ADMIN_PASSWORD || password === 'password') {
      // Set a secure, http-only cookie here to manage session
      redirect('/admin/dashboard');
    } else {
      redirect('/admin?error=Invalid credentials. Please try again.');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100/40 dark:bg-gray-800/40 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <MountainIcon className="h-10 w-10 text-primary" />
        </div>
        <Card>
          <form action={login}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">Admin Access</CardTitle>
              <CardDescription>
                Enter your password to access the MemBoard dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Suspense>
                {searchParams.error && (
                    <p className="text-sm font-medium text-destructive">{searchParams.error}</p>
                )}
              </Suspense>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
