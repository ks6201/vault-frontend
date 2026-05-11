export interface Project {
  id: string;
  name: string;
  salt: string;
  createdAt: string;
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface SecretListItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface Secret {
  name: string;
  encryptedValue: string;
  createdAt: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

// Projects
export async function listUserProjects(): Promise<Project[]> {
  return request<Project[]>('/users/me/projects');
}

export async function getProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`);
}

export async function createProject(name: string, _opts?: { salt?: string; apiKey?: string }): Promise<{ id: string; name: string; salt: string; apiKey: string }> {
  const salt = _opts?.salt ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  const apiKey = _opts?.apiKey ?? 'vault_' + Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
  return request('/users/me/projects', {
    method: 'POST',
    body: JSON.stringify({ name, salt, apiKey }),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return request(`/projects/${id}`, { method: 'DELETE' });
}

// Environments
export async function listEnvironments(projectId: string): Promise<Environment[]> {
  return request(`/projects/${projectId}/environments`);
}

export async function createEnvironment(projectId: string, name: string): Promise<Environment> {
  return request(`/projects/${projectId}/environments`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteEnvironment(projectId: string, envId: string): Promise<void> {
  return request(`/projects/${projectId}/environments/${envId}`, { method: 'DELETE' });
}

// Secrets
export async function listSecrets(envId: string): Promise<SecretListItem[]> {
  return request(`/environments/${envId}/secrets`);
}

export async function getSecret(envId: string, name: string): Promise<Secret> {
  return request(`/environments/${envId}/secrets/${name}`);
}

export async function createSecret(envId: string, name: string, encryptedValue: string): Promise<SecretListItem> {
  return request(`/environments/${envId}/secrets`, {
    method: 'POST',
    body: JSON.stringify({ name, encryptedValue }),
  });
}

export async function deleteSecret(envId: string, name: string): Promise<void> {
  return request(`/environments/${envId}/secrets/${name}`, { method: 'DELETE' });
}
