import type { TokenPayload } from '#modules/user/user.types.ts';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
