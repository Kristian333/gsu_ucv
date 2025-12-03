// /app/admingroup/page.tsx
import { redirect } from 'next/navigation';

export default function AdminRedirectPage() {
  redirect('/admingroup/dashboard');
}