export const PAGE_ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DEPARTMENT_LIST: '/management/department/list',
  CREATE_DEPARTMENT: '/management/department/create',
  EDIT_DEPARTMENT: '/management/department/[id]/edit',
  DEPARTMENT_USER: '/management/department/[id]/edit/users',
  USERS_LIST: '/management/users/list',
  CREATE_USER: '/management/users/create',
  EDIT_USER: '/management/users/[id]/edit',
  PROFILE_PAGE: '/profile',
  CHANGE_PASSWORD_PAGE: '/profile/change-password',
} as const;
