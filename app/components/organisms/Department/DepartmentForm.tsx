'use client';

import {
  createDepartmentSchema,
  DEPARTMENT_MAX_LENGTH,
  DepartmentFormValues,
} from '@/schema/department.schema';
import { Textarea } from '@heroui/input';
import type { CardProps } from '@heroui/react';
import { toast } from 'react-hot-toast';

import { useCreateDepartment } from '@/app/hooks/useDepartment';
import {
  Button,
  Card,
  CardBody,
  Divider,
  Form,
  Input,
  Spacer,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

type DepartmentFormData = {
  name: string;
  description?: string | null;
};

interface DepartmentFormProps extends CardProps {
  type: 'create' | 'edit';
  data?: DepartmentFormData | null;
}

export default function DepartmentForm({
  type,
  data,
  ...props
}: DepartmentFormProps) {
  const t = useTranslations('DepartmentPage.createDepartment');
  const schema = useMemo(() => createDepartmentSchema(t), [t]);
  const { createDepartment, isCreating, error } = useCreateDepartment();

  //form schema
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name ?? '',
      description: data?.description ?? '',
    },
  });

  //submit
  const onSubmit = async (values: DepartmentFormValues) => {
    const response = await createDepartment(values);
    if (response?.success) {
      toast.success(t('createSuccess'));
      reset();
    } else {
      console.log('error', error);
      toast.error(t('createFailed'));
    }
  };

  //loading
  const isLoading = isCreating || isSubmitting;

  return (
    <Card className="w-full" {...props}>
      <CardBody className="px-4">
        <Form
          className="gap-0 mt-4"
          validationBehavior="native"
          onSubmit={handleSubmit(onSubmit)}
          id="create-department-form"
        >
          {/* Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                isClearable
                isRequired
                label={t('name')}
                maxLength={DEPARTMENT_MAX_LENGTH}
                placeholder={t('namePlaceholder')}
                value={field.value}
                onValueChange={field.onChange}
                isInvalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
              />
            )}
          />
          <Spacer y={6} />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                isClearable
                label={t('description')}
                placeholder={t('descriptionPlaceholder')}
                value={field.value}
                onValueChange={field.onChange}
                isInvalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
              />
            )}
          />
          <Spacer y={6} />
          <Divider />
          <div className="flex w-full flex-wrap-reverse items-center justify-between gap-2 px-4 pt-4 md:flex-wrap">
            <Button color="primary" type="submit" isLoading={isLoading}>
              {t('create')}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
