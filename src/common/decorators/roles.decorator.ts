import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/roles.enum';
import { ROLES_KEY } from '../constants/permissions.constant';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
