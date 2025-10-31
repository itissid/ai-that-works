export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Session {
  userId: string;
  email: string;
  expiresAt: Date;
}

export interface MagicLinkToken {
  email: string;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}
