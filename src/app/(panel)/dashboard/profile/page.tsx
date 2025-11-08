import getSession from '@/lib/getSesstion';
import { get } from 'http';
import { redirect } from 'next/navigation';
import { getUserData } from './_data-acess/get-info-user';
import { ProfileContent } from './_components/profileContent';

export default async function Profile() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const user = await getUserData({ userId: session.user?.id });

  if (!user) {
    redirect('/');
  }

  return (
    <div>
      <ProfileContent />
    </div>
  )
}