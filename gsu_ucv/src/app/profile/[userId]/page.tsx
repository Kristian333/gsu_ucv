import React from 'react';
import { UserProfileClient } from '@/components/ui/user-profile'; // Import the client component

// This function runs on the server to get user data.
async function getUserData(userId: string) {
  console.log(`Buscando datos del usuario ${userId} en el servidor...`);
  return {
    name: `Pedro Perez`,
    bio: `Esta es la biografía del usuario.`,
    avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
  };
}

// This is the default export, a Server Component that fetches data and renders the client component.
export default async function HybridUserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const user = await getUserData(userId);

  return (
    // Return a React component, in this case, the UserProfileClient.
    <UserProfileClient name={user.name} bio={user.bio} avatarUrl={user.avatarUrl} />
  );
}