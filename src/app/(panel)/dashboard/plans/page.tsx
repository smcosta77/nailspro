
import getSession from '@/lib/getSesstion';
import { redirect } from 'next/navigation';


export default async function Plans() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Página Planos...</h1>
    </div>
  )
}