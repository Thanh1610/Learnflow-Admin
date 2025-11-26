import CardInfo from '@/app/components/molecules/ui/CardInfo';
import CourseForm from '@/app/components/organisms/Course/CourseForm';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getServerUser } from '@/lib/server-auth';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  ...metaObject('Create Course'),
};

export default async function CreateCoursePage() {
  const t = await getTranslations('CoursePage');
  const tApp = await getTranslations('app');
  const user = await getServerUser();
  const userId = user?.sub;

  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('createCourse.title')}
        description={t('createCourse.description')}
        breadcrumbs={[
          {
            label: tApp('home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: tApp('courseList'),
            href: PAGE_ROUTES.COURSE_LIST,
          },
          {
            label: t('createCourse.title'),
            href: PAGE_ROUTES.COURSE_CREATE,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <CourseForm type="create" userId={userId} />
      </div>
    </div>
  );
}
