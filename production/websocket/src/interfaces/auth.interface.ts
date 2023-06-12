export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class UsersResponseDto {
  id: string;

  username: string;

  createdAt: number;

  role?: UserRole;

  supportedLoginTypes: string[];

  sessions: string[];

  hash: string[];

  locked: boolean;

  credentials: Record<string, unknown>[];

  settings: Record<string, unknown>;

  avatar: string;

  description: string;

  constructor(partial: Partial<UsersResponseDto>) {
    Object.assign(this, partial);
  }
}
