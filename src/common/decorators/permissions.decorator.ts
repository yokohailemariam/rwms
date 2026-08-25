import { SetMetadata } from '@nestjs/common';
import { Permission, PERMISSIONS_KEY } from '../constants/permissions.constant';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
