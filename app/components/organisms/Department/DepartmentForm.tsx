'use client';

import {
  createDepartmentSchema,
  DEPARTMENT_MAX_LENGTH,
  DepartmentFormValues,
} from '@/schema/department.schema';
import { Textarea } from '@heroui/input';
import type { CardProps, Selection } from '@heroui/react';
import { toast } from 'react-hot-toast';

import CustomSelect from '@/app/components/atoms/CustomSelect';
import { useCreateDepartment } from '@/app/hooks/useDepartment';
import { useUsersNotInDepartment } from '@/app/hooks/useUsersNotInDepartment';
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
import { LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

type DepartmentFormData = {
  id?: number;
  name: string;
  description?: string | null;
  isPublic?: boolean;
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
  const tEdit = useTranslations('DepartmentPage.editDepartment');
  const tStatus = useTranslations('DepartmentPage');
  const schema = useMemo(() => createDepartmentSchema(t), [t]);
  const router = useRouter();
  const { createDepartment, isCreating, error, updateDepartment, isUpdating } =
    useCreateDepartment();
  const [statusOverride, setStatusOverride] = useState<boolean | null>(null);
  const isPublic = statusOverride ?? data?.isPublic ?? true;

  // Fetch users not in this department (only when editing)
  const { users: usersNotInDepartment } = useUsersNotInDepartment(
    type === 'edit' && data?.id ? data.id : null
  );
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

  const handleStatusChange = (keys: Selection) => {
    const [selectedKey] = Array.from(keys);
    setStatusOverride(selectedKey === 'true');
  };

  //submit
  const onSubmit = async (values: DepartmentFormValues) => {
    const sanitizedValues = {
      name: values.name,
      description: values.description ?? '',
    };
    const payload = {
      ...sanitizedValues,
      isPublic,
    };

    const response =
      type === 'create'
        ? await createDepartment(payload)
        : data?.id
          ? await updateDepartment({ id: data.id, ...payload })
          : null;
    if (!response) {
      toast.error(t('createFailed'));
      return;
    }
    if (response?.success) {
      toast.success(
        type === 'create' ? t('createSuccess') : tEdit('editSuccess')
      );
      if (type === 'create') {
        reset();
      } else {
        router.refresh();
      }
    } else {
      console.log('error', error);
      toast.error(type === 'create' ? t('createFailed') : tEdit('editFailed'));
    }
  };

  //loading
  const isLoading = isCreating || isSubmitting || isUpdating;

  const statusOptions = [
    {
      key: true,
      label: tStatus('isPublic'),
      endContent: <LockKeyholeOpen className="text-default-400" />,
    },
    {
      key: false,
      label: tStatus('isPrivate'),
      endContent: <LockKeyhole className="text-default-400" />,
    },
  ];

  return (
    <Card className="w-full" {...props}>
      <CardBody className="px-4">
        <Form
          className="mt-4 gap-0"
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

          {/* Status */}
          <CustomSelect
            options={statusOptions}
            label={tStatus('status')}
            selectionMode="single"
            defaultSelectedKey={isPublic}
            onSelectionChange={handleStatusChange}
          />

          <Spacer y={6} />

          <Divider />
          <div className="flex w-full items-center justify-center px-4 pt-4">
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              className="min-w-[200px]"
            >
              {type === 'create' ? t('create') : t('saveChanges')}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
