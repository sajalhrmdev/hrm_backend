export type ColumnType = "string" | "number" | "date" | "boolean" | "enum" | "lookup";

export type DuplicateStrategy = "skip" | "upsert";

export interface LookupConfig {
  model: string;
  key: string;
  value: string;
  scopeByCompany: boolean;
}

export interface ImportColumn {
  header: string;
  field: string;
  required: boolean;
  type: ColumnType;
  unique?: boolean;
  defaultValue?: any;
  enumValues?: string[];
  lookup?: LookupConfig;
  transform?: (value: any) => any;
}

export interface UniqueCheck {
  fields: string[];
  message: string;
}

export interface ImportConfig {
  entity: string;
  label: string;
  model: string;
  templateName: string;
  columns: ImportColumn[];
  uniqueCheck: UniqueCheck[];
  dedupeKey?: string[];
  duplicateStrategy: DuplicateStrategy;
  requiresCompanyId: boolean;
  employeeRef?: string;
  isComposite?: boolean;
  instructions?: string;
  rowValidator?: (
    data: Record<string, any>,
    companyId: number
  ) => Promise<ImportError[]>;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface PreviewRow {
  row: number;
  status: "valid" | "invalid";
  data: Record<string, any>;
  errors: ImportError[];
}

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  failed: number;
  errors: ImportError[];
  previewRows?: PreviewRow[];
}

export interface ImportConfigSummary {
  entity: string;
  label: string;
  templateName: string;
  columnCount: number;
}
