import { metaObject } from '@/config/site.config';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { getTranslations } from 'next-intl/server';
import CardInfo from '@/app/components/molecules/ui/CardInfo';
import CourseForm from './index';

export const metadata = {
  ...metaObject('Course List'),
};
export default async function CourseListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: _id } = await params;
  const t = await getTranslations('CoursePage.courseList');
  const tApp = await getTranslations('app');
  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('title')}
        description={t('description')}
        breadcrumbs={[
          {
            label: tApp('home'),
            href: PAGE_ROUTES.HOME,
          },
          {
            label: tApp('courseInDepartment'),
            href: PAGE_ROUTES.COURSE_IN_DEPARTMENT,
          },
          {
            label: t('title'),
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <CourseForm />
      </div>
    </div>
  );
}
