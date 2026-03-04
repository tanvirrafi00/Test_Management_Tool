import { redirect } from 'next/navigation';

export default function Home() {
    // This is a server component, so we can't access localStorage
    // Redirect to login page by default
    redirect('/auth/login');
}
