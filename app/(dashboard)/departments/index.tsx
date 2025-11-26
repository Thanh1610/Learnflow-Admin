'use client';

import { Card, CardFooter, Image, Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Department } from '@/types/department.type';
import defaultDepartment from '@/public/image/default_department.png';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { redirect } from 'next/navigation';
import { PAGE_ROUTES } from '@/config/pageRoutes';

type SectionKey = 'public' | 'private';

const SECTION_META: Record<SectionKey, { badgeDotClass: string }> = {
  public: { badgeDotClass: 'bg-success-500' },
  private: { badgeDotClass: 'bg-warning-500' },
};

export default function DepartmentList({ data }: { data: Department[] }) {
  const t = useTranslations('CoursePage');
  const tApp = useTranslations('app');

  const publicDepartments = data.filter(dept => dept.isPublic);
  const privateDepartments = data.filter(dept => !dept.isPublic);
  const sections: Array<{ key: SectionKey; items: Department[] }> = [
    { key: 'public', items: publicDepartments },
    { key: 'private', items: privateDepartments },
  ];

  const handleView = (id: string) => {
    redirect(PAGE_ROUTES.DEPARTMENT_COURSE_LIST.replace('[id]', id));
  };

  return (
    <div className="space-y-8">
      {sections.map(({ key, items }) => (
        <section
          key={key}
          className="border-default-200 bg-content1/60 space-y-4 rounded-2xl border p-4 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                {t(`sections.${key}.title`)}
              </h2>
              <p className="text-default-500 text-sm">
                {t(`sections.${key}.description`)}
              </p>
            </div>
            <Chip
              variant="flat"
              color={key === 'public' ? 'success' : 'warning'}
              className="bg-default-50 text-default-600"
              startContent={
                <span
                  className={`size-2 rounded-full ${SECTION_META[key].badgeDotClass}`}
                />
              }
            >
              {t('sections.countLabel', { count: items.length })}
            </Chip>
          </div>
          {items.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map(item => (
                <Tooltip
                  key={item.id}
                  content={item.description || t('sections.noDescription')}
                  placement="top"
                  color="primary"
                  className="max-w-sm text-left"
                  showArrow={true}
                  delay={1000}
                >
                  <Card
                    className="border-none transition-transform duration-200 hover:scale-[1.02]"
                    radius="lg"
                  >
                    <Image
                      alt={item.name}
                      className="h-full w-full object-cover"
                      src={item.image || defaultDepartment.src}
                    />
                    <CardFooter className="rounded-large shadow-small absolute bottom-1 z-10 ml-1 flex w-[calc(100%-8px)] items-center justify-between overflow-hidden border-1 border-white/30 bg-black/70 px-3 py-2 backdrop-blur-md">
                      <p className="text-sm font-medium text-white drop-shadow">
                        {item.name}
                      </p>
                      <Button
                        className="text-tiny bg-white/20 text-white"
                        color="default"
                        radius="lg"
                        size="sm"
                        variant="flat"
                        onClick={() => handleView(item.id.toString())}
                      >
                        {tApp('view')}
                      </Button>
                    </CardFooter>
                  </Card>
                </Tooltip>
              ))}
            </div>
          ) : (
            <p className="text-default-500 text-sm">
              {t(`sections.${key}.empty`)}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
