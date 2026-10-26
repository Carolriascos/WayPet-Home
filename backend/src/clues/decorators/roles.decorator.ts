
import { SetMetadata } from '@nestjs/common';
import { AuthUser } from '../../auth/interfaces/auth-user.interface';

export const ROLES_KEY = 'roles';

export const Roles = (
  ...roles: AuthUser['role'][]
) => SetMetadata(ROLES_KEY, roles);
