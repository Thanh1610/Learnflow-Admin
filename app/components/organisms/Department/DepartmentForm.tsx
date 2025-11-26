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
import { useUploadAvatar } from '@/app/hooks/useUploadAvatar';
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
import AvatarUpload from '@/app/components/molecules/ui/AvatarUpload';
import defaultDepartment from '@/public/image/default_department.png';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import type { FetchError } from '@/lib/fetcher';

type DepartmentFormData = {
  id?: number;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  image?: string | null;
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
  console.log('data', data);
  const t = useTranslations('DepartmentPage.createDepartment');
  const tEdit = useTranslations('DepartmentPage.editDepartment');
  const tStatus = useTranslations('DepartmentPage');
  const schema = useMemo(() => createDepartmentSchema(t), [t]);
  const router = useRouter();
  const { createDepartment, isCreating, error, updateDepartment, isUpdating } =
    useCreateDepartment();
  const { uploadAvatar, isLoading: isUploadingAvatar } = useUploadAvatar();
  const [statusOverride, setStatusOverride] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    data?.image ?? null
  );
  const isPublic = statusOverride ?? data?.isPublic ?? true;

  // Fetch users not in this department (only when editing)
  //form schema
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name ?? '',
      description: data?.description ?? '',
      image: data?.image ?? '',
    },
  });

  const handleStatusChange = (keys: Selection) => {
    const [selectedKey] = Array.from(keys);
    setStatusOverride(selectedKey === 'true');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  //submit
  const onSubmit = async (values: DepartmentFormValues) => {
    let finalImageUrl = avatarUrl || values.image || '';

    // Upload avatar first if a new file was selected
    if (selectedFile) {
      // Get old avatar URL before uploading new one
      const oldAvatarUrl = avatarUrl || data?.image || null;
      const uploadResponse = await uploadAvatar(selectedFile, oldAvatarUrl);
      if (uploadResponse?.success && uploadResponse.data?.url) {
        finalImageUrl = uploadResponse.data.url;
        setAvatarUrl(finalImageUrl);
        setValue('image', finalImageUrl); // Update form value
        setSelectedFile(null); // Clear selected file after successful upload
      } else {
        // If upload failed, don't proceed with department create/update
        return;
      }
    }

    const sanitizedValues = {
      name: values.name,
      description: values.description ?? '',
      image: finalImageUrl,
    };
    const payload = {
      ...sanitizedValues,
      isPublic,
    };

    let response = null;
    try {
      response =
        type === 'create'
          ? await createDepartment(payload)
          : data?.id
            ? await updateDepartment({ id: data.id, ...payload })
            : null;
    } catch (err) {
      const fetchError = err as FetchError<{ error?: string }>;
      if (fetchError?.status === 409) {
        toast.error(t('nameExists'));
      } else if (fetchError?.status === 403) {
        toast.error(t('permissionDenied'));
      } else {
        console.error('Department submit failed', err);
        toast.error(
          type === 'create' ? t('createFailed') : tEdit('editFailed')
        );
      }
      return;
    }
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
        setAvatarUrl(null);
        setSelectedFile(null);
      }
      router.push(PAGE_ROUTES.DEPARTMENT_LIST);
      router.refresh();
    } else {
      console.log('error', error);
      toast.error(type === 'create' ? t('createFailed') : tEdit('editFailed'));
    }
  };

  //loading
  const isLoading =
    isCreating || isSubmitting || isUpdating || isUploadingAvatar;

  // Display avatar - use preview from selected file, then avatarUrl, then form value, then data
  const displayAvatar = avatarUrl || data?.image || '';

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
          {/* Img */}
          <Controller
            name="image"
            control={control}
            render={({ field: _field }) => (
              <AvatarUpload
                avatar={displayAvatar}
                onFileSelect={handleFileSelect}
                isLoading={isUploadingAvatar}
                defaultImg={defaultDepartment.src}
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
