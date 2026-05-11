export interface Project {
  id: string;
  name: string;
  salt: string;
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

export interface VaultConfig {
  baseUrl: string;
  apiKey: string;
}

export interface EncryptedBlob {
  ciphertext: string;
  iv: string;
}

export interface CreateProjectResult {
  id: string;
  name: string;
  apiKey: string;
  salt: string;
}
