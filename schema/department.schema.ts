import { z } from 'zod';

export const DEPARTMENT_MAX_LENGTH = 50;

type TranslationFunction = (
  key: string,
  values?: Record<string, any>
) => string;

export const createDepartmentSchema = (t: TranslationFunction) => {
  return z.object({
    name: z
      .string()
      .min(1, t('validation.nameRequired'))
      .max(
        DEPARTMENT_MAX_LENGTH,
        t('validation.nameMaxLength', { max: DEPARTMENT_MAX_LENGTH })
      ),
    description: z.string().optional(),
  });
};

export type DepartmentFormValues = z.infer<
  ReturnType<typeof createDepartmentSchema>
>;
