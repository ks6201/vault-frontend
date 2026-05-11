import { VaultClient } from './api-client';
import { deriveKey, encrypt, decrypt, encodeBlob, decodeBlob, generateSalt } from './crypto';
import { SecretCache, cacheKey as makeCacheKey } from './cache';
import type { VaultConfig, CreateProjectResult, SecretListItem, Secret, EncryptedBlob } from './types';

export type { VaultConfig, CreateProjectResult, SecretListItem, Secret, EncryptedBlob };

export class Vault {
  readonly client: VaultClient;
  private cache = new SecretCache();

  constructor(config: VaultConfig) {
    this.client = new VaultClient(config);
  }

  async createProject(name: string, password: string): Promise<CreateProjectResult & { encryptedKey: string }> {
    const salt = generateSalt();
    const key = await deriveKey(password, salt);
    const encryptedKey = await encrypt(password, key);
    const result = await this.client.createProject(name);
    return { ...result, encryptedKey: encodeBlob(encryptedKey) };
  }

  async getProject(projectId: string) {
    return this.client.getProject(projectId);
  }

  async deleteProject(projectId: string) {
    return this.client.deleteProject(projectId);
  }

  async createEnvironment(projectId: string, name: string) {
    return this.client.createEnvironment(projectId, name);
  }

  async deleteEnvironment(projectId: string, envId: string) {
    return this.client.deleteEnvironment(projectId, envId);
  }

  async setSecret(
    environmentId: string,
    name: string,
    plaintext: string,
    password: string,
    salt: string,
  ): Promise<SecretListItem> {
    const key = await deriveKey(password, salt);
    const blob = await encrypt(plaintext, key);
    const result = await this.client.createSecret(environmentId, name, encodeBlob(blob));
    this.cache.set(makeCacheKey(environmentId, name), plaintext);
    return result;
  }

  async getSecret(
    environmentId: string,
    name: string,
    password: string,
    salt: string,
  ): Promise<string> {
    const key = makeCacheKey(environmentId, name);
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;

    const secret = await this.client.getSecret(environmentId, name);
    const derivedKey = await deriveKey(password, salt);
    const blob = decodeBlob(secret.encryptedValue);
    const plaintext = await decrypt(blob, derivedKey);
    this.cache.set(key, plaintext);
    return plaintext;
  }

  async listSecrets(environmentId: string) {
    return this.client.listSecrets(environmentId);
  }

  async deleteSecret(environmentId: string, name: string) {
    await this.client.deleteSecret(environmentId, name);
    this.cache.invalidate(makeCacheKey(environmentId, name));
  }

  invalidateCache(environmentId?: string, name?: string): void {
    if (environmentId && name) {
      this.cache.invalidate(makeCacheKey(environmentId, name));
    } else {
      this.cache.invalidate();
    }
  }
}

export {
  generateSalt, deriveKey, encrypt, decrypt, encodeBlob, decodeBlob,
  generateMasterKey, deriveKEK, encryptMasterKey, decryptMasterKey,
  deriveApiKey, deriveProjectKey,
} from './crypto';
export { SecretCache } from './cache';
export { VaultClient } from './api-client';
