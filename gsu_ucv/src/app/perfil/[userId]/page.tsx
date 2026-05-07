// app/profile-dynamic/[userId]/page.tsx

import React from 'react';

// Esta directiva fuerza el renderizado dinámico en el servidor.
// El componente se genera en cada solicitud.
export const dynamic = 'force-dynamic';

async function getUserData(userId: string) {
  // Simulación de una llamada a la API o base de datos en el servidor
  console.log(`Buscando datos del usuario ${userId} en el servidor...`);
  return {
    name: `Usuario Dinámico ${userId}`,
    bio: `Esta es la biografía del usuario ${userId}. Renderizado completamente en el servidor.`,
  };
}

export default async function DynamicUserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const user = await getUserData(userId);

  return (
    <div className="flex flex-col items-center mt-20 p-8 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Perfil Dinámico de {user.name}</h1>
      <p className="text-gray-700 text-center">{user.bio}</p>
      <p className="mt-4 text-sm text-gray-500">Renderizado de forma completamente dinámica.</p>
    </div>
  );
}