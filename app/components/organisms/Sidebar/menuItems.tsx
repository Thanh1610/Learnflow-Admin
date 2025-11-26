import { LanguageToggle } from '@/app/components/atoms/Language';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import { USER_ROLES } from '@/config/constants';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import {
  BarChart,
  Book,
  Building,
  FileText,
  HelpCircle,
  Home,
  Monitor,
  Settings,
  Users,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ReactElement } from 'react';
export interface MenuItem {
  href?: string;
  icon?: ReactElement;
  label?: string;
  items?: MenuItem[];
  labelFirst?: boolean;
}

export async function getMenuItems(
  initialLocale: string,
  userRole?: string | null
): Promise<MenuItem[]> {
  const t = await getTranslations('sidebar');

  const managementItems: MenuItem[] = [];

  // Chỉ SYSTEM_ADMIN mới thấy menu Users
  if (userRole === USER_ROLES.SYSTEM_ADMIN) {
    managementItems.push({
      href: PAGE_ROUTES.USERS_LIST,
      icon: <Users className="h-5 w-5" />,
      label: t('management.users'),
    });
  }

  managementItems.push(
    {
      href: '/management/questions',
      icon: <HelpCircle className="h-5 w-5" />,
      label: t('management.questions'),
    },
    {
      href: PAGE_ROUTES.DEPARTMENT_LIST,
      icon: <Building className="h-5 w-5" />,
      label: t('management.department'),
    }
  );

  return [
    {
      href: '/',
      icon: <Home className="h-5 w-5" />,
      label: t('home'),
    },
    {
      href: PAGE_ROUTES.COURSE_IN_DEPARTMENT,
      icon: <FileText className="h-5 w-5" />,
      label: t('departments'),
    },
    {
      href: PAGE_ROUTES.COURSE_LIST,
      icon: <Book className="h-5 w-5" />,
      label: t('courses'),
    },
    {
      href: '/management',
      icon: <Monitor className="h-5 w-5" />,
      label: t('management.heading'),
      items: managementItems,
    },
    {
      href: '/analytics',
      icon: <BarChart className="h-5 w-5" />,
      label: t('analytics'),
    },
    {
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: t('settings.heading'),
      items: [
        {
          icon: <ThemeSwitcher />,
          label: t('settings.theme'),
          labelFirst: true,
        },
        {
          icon: <LanguageToggle initialLocale={initialLocale} />,
          label: t('settings.language'),
          labelFirst: true,
        },
      ],
    },
  ];
}
