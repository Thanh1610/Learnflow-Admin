import CardInfo from '@/app/components/molecules/ui/CardInfo';
import CourseForm from '@/app/components/organisms/Course/CourseForm';
import { getCourseById } from '@/app/hooks/serverHooks/useCourse';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { metaObject } from '@/config/site.config';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  ...metaObject('Edit Course'),
};

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('CoursePage');
  const tApp = await getTranslations('app');
  const { id } = await params;

  const course = await getCourseById(id);

  return (
    <div className="flex flex-col gap-8">
      <CardInfo
        title={t('editCourse.title')}
        description={t('editCourse.description')}
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
            label: t('editCourse.title'),
            href: PAGE_ROUTES.COURSE_EDIT,
            isCurrent: true,
          },
        ]}
      />
      <div className="px-8">
        <CourseForm
          type="edit"
          data={
            course
              ? {
                  id: course.id,
                  name: course.name,
                  description: course.description,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
