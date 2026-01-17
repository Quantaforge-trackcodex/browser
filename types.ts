
export enum ViewType {
  WORKSPACE = 'WORKSPACE',
  COMMAND = 'COMMAND',
  LOCAL_FORGE = 'LOCAL_FORGE',
  SETTINGS = 'SETTINGS',
  GIT = 'GIT',
  HISTORY = 'HISTORY',
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  source: string;
  url?: string;
  codeSnippet?: string;
}

export interface SecurityVulnerability {
  line: number;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  fix: string;
}

export interface SystemStats {
  gpu: number;
  npu: number;
  vram: string;
  cpu: number;
  ram: string;
  temp: number;
}
