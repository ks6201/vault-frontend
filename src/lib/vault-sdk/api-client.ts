import type { VaultConfig, CreateProjectResult, Project, Environment, SecretListItem, Secret } from './types';
import { generateSalt } from './crypto';

export class VaultClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: VaultConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as T;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  async createProject(name: string): Promise<CreateProjectResult> {
    const salt = generateSalt();
    const apiKey = generateApiKey();
    const result = await this.request<CreateProjectResult>('POST', '/api/projects', {
      name,
      salt,
      apiKey,
    });
    this.apiKey = apiKey;
    return { ...result, apiKey };
  }

  async getProject(projectId: string): Promise<Project> {
    return this.request<Project>('GET', `/api/projects/${projectId}`);
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request<void>('DELETE', `/api/projects/${projectId}`);
  }

  async createEnvironment(projectId: string, name: string): Promise<Environment> {
    return this.request<Environment>('POST', `/api/projects/${projectId}/environments`, { name });
  }

  async deleteEnvironment(projectId: string, envId: string): Promise<void> {
    await this.request<void>('DELETE', `/api/projects/${projectId}/environments/${envId}`);
  }

  async createSecret(environmentId: string, name: string, encryptedValue: string): Promise<SecretListItem> {
    return this.request<SecretListItem>('POST', `/api/environments/${environmentId}/secrets`, {
      name,
      encryptedValue,
    });
  }

  async getSecret(environmentId: string, name: string): Promise<Secret> {
    return this.request<Secret>('GET', `/api/environments/${environmentId}/secrets/${name}`);
  }

  async listSecrets(environmentId: string): Promise<SecretListItem[]> {
    return this.request<SecretListItem[]>('GET', `/api/environments/${environmentId}/secrets`);
  }

  async deleteSecret(environmentId: string, name: string): Promise<void> {
    await this.request<void>('DELETE', `/api/environments/${environmentId}/secrets/${name}`);
  }
}

function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `vault_${hex}`;
}
