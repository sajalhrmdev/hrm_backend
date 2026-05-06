declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        [key: string]: unknown;
      };
      companyId?: number;
      membership?: unknown;
      employee?: {
        id: number;
        companyId: number;
        [key: string]: unknown;
      };
    }
  }
}

export {};
