import getSession from '@/lib/getSesstion';
import { redirect } from 'next/navigation';

export default async function Dashboard() {

  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <div>
      <h1>Página Dashboard....</h1>

    </div>
  )
}