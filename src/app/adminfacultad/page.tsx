// /app/adminfacultad/page.tsx
import { redirect } from 'next/navigation';

export default function AdminRedirectPage() {
  redirect('/adminfacultad/dashboard');
}