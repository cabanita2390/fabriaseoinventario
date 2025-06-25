// src/auth/decorators/roles.decorator.ts
import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { AppRole } from '../constants/roles.constant';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
