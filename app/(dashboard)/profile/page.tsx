import CardInfo from '@/app/components/molecules/ui/CardInfo';
import { getUserById } from '@/app/hooks/serverHooks/useUser';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getServerUser } from '@/lib/server-auth';
import { getTranslations } from 'next-intl/server';
import ProfileForm from './index';
export const metadata = {
  ...metaObject('Profile'),
};

export default async function ProfilePage() {
  const t = await getTranslations('ProfilePage');
  const user = await getServerUser();
  const userId = user?.sub;
  const userData = await getUserById(userId?.toString() ?? '');

  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('title')}
        description={t('description')}
        breadcrumbs={[
          {
            label: t('home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: t('profile'),
            href: PAGE_ROUTES.PROFILE_PAGE,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <ProfileForm userData={userData ?? undefined} />
      </div>
    </div>
  );
}
