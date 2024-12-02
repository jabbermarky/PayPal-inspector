// src/shared/types/integration.ts
export interface IntegrationConfig {
    regex: RegExp;
    includeQueryParams?: string[];
    versionGroup?: number;
  }
  
  export interface IntegrationMatch {
    name: string;
    version?: string;
  }
  