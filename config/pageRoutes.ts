export const PAGE_ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DEPARTMENT_LIST: '/management/department/list',
  CREATE_DEPARTMENT: '/management/department/create',
  EDIT_DEPARTMENT: '/management/department/[id]/edit',
  DEPARTMENT_USER: '/management/department/[id]/edit/users',
} as const;
