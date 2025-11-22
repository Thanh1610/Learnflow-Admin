import type { User as UserType } from '@/app/hooks/useUsersInDepartment';
import { getAvatarProps } from '@/lib/avatar';
import { Button, cn, User } from '@heroui/react';
import { Trash } from 'lucide-react';

interface DepartmentUserGroupProps {
  users: UserType[];
  onRemoveUser: (userId: number) => void;
  removingUserId?: number | null;
}

export default function DepartmentUserGroup({
  users,
  onRemoveUser,
  removingUserId = null,
}: DepartmentUserGroupProps) {
  const handleRemoveUser = (userId: number) => {
    onRemoveUser(userId);
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:gap-2">
      {users.map(user => (
        <div
          key={user.id}
          className={cn(
            'bg-content1 m-0 flex w-full',
            'hover:bg-content2 items-center justify-start',
            'gap-2 rounded-lg p-2 sm:gap-3 sm:p-3 md:p-4',
            'border-default-200 border-2'
          )}
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <User
                avatarProps={getAvatarProps(
                  user.id,
                  user.name,
                  user.email,
                  'md'
                )}
                description={
                  <span className="sm:text-small text-default-500 truncate text-xs">
                    {user.email}
                  </span>
                }
                name={
                  <span className="truncate text-sm sm:text-base">
                    {user.name || user.email}
                  </span>
                }
              />
            </div>
            <Button
              onClick={() => handleRemoveUser(user.id)}
              aria-label="Remove user"
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              className="shrink-0"
              isLoading={removingUserId === user.id}
              isDisabled={removingUserId !== null}
            >
              <Trash size={16} className="h-4 w-4 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
