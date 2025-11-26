'use client';

import { z } from 'zod';
import { Button, Card, CardBody, Form, Input, Spacer } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useCreateNewEditCourse } from '@/app/hooks/useCreateNewEditCourse';

const createCourseSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
  });

type CourseFormValues = z.infer<ReturnType<typeof createCourseSchema>>;

interface CourseFormProps {
  type: 'create' | 'edit';
  data?: {
    id: number;
    name: string;
    description?: string | null;
    userid: number;
  } | null;
  userId?: number;
}

export default function CourseForm({ type, data, userId }: CourseFormProps) {
  const t = useTranslations('CoursePage');
  const schema = createCourseSchema((key: string) =>
    t(`courseForm.${key}` as never)
  );
  const { mutate } = useCreateNewEditCourse(type, data?.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name ?? '',
      description: data?.description ?? '',
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    await mutate({
      name: values.name,
      description: values.description ?? '',
      userId,
    });
    reset();
  };

  return (
    <Card className="w-full">
      <CardBody className="px-4">
        <Form
          className="mt-4 gap-0"
          validationBehavior="native"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            {...register('name')}
            isRequired
            label={t('courseForm.name')}
            placeholder={t('courseForm.namePlaceholder')}
            isInvalid={Boolean(errors.name)}
            errorMessage={errors.name?.message}
          />
          <Spacer y={4} />
          <Input
            {...register('description')}
            label={t('courseForm.description')}
            placeholder={t('courseForm.descriptionPlaceholder')}
            isInvalid={Boolean(errors.description)}
            errorMessage={errors.description?.message}
          />
          <Spacer y={6} />
          <div className="flex w-full items-center justify-center">
            <Button color="primary" type="submit" isLoading={isSubmitting}>
              {type === 'create'
                ? t('courseForm.create')
                : t('courseForm.saveChanges')}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
