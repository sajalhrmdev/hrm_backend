export interface DetectIntentRequest {
  companyId: number;

  userId: number;

 

  permissions: string[];

  schemaContext: string;

  message: string;
}

export interface PrismaQuery {
  model: string;

  operation:
    | "findMany"
    | "findFirst"
    | "findUnique"
    | "count"
    | "aggregate";

  where?: Record<string, any>;

  include?: Record<string, any>;

  select?: Record<string, any>;

  orderBy?: Record<string, any>;

  take?: number;

  skip?: number;
}

export interface DetectIntentResponse {
  success: boolean;

  data: PrismaQuery;
}