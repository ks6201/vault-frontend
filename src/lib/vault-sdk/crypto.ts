import type { EncryptedBlob } from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PBKDF2_ITERATIONS = 600_000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const saltBytes = new Uint8Array(salt.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );

  return {
    iv: bufferToHex(iv),
    ciphertext: bufferToBase64(new Uint8Array(ciphertext)),
  };
}

export async function decrypt(blob: EncryptedBlob, key: CryptoKey): Promise<string> {
  const iv = new Uint8Array(blob.iv.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  const ciphertext = base64ToBuffer(blob.ciphertext);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  return decoder.decode(plaintext);
}

const MASTER_KEY_BYTES = 32;

export function generateMasterKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(MASTER_KEY_BYTES));
  return bufferToHex(bytes);
}

export async function deriveKEK(password: string, email: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const saltBytes = encoder.encode(`vault-kek:${email}`);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptMasterKey(masterKeyHex: string, kek: CryptoKey): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    kek,
    encoder.encode(masterKeyHex),
  );

  return {
    iv: bufferToHex(iv),
    ciphertext: bufferToBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptMasterKey(blob: EncryptedBlob, kek: CryptoKey): Promise<string> {
  const iv = new Uint8Array(blob.iv.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  const ciphertext = base64ToBuffer(blob.ciphertext);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    kek,
    ciphertext.buffer as ArrayBuffer,
  );

  return decoder.decode(plaintext);
}

async function hexToBytes(hex: string): Promise<CryptoKey> {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  return crypto.subtle.importKey('raw', bytes, 'HKDF', false, ['deriveBits']);
}

export async function deriveApiKey(masterKeyHex: string, projectSalt: string): Promise<string> {
  const keyMaterial = await hexToBytes(masterKeyHex);
  const saltBytes = new Uint8Array(projectSalt.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      salt: saltBytes,
      info: encoder.encode('api-key'),
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH,
  );

  return `vault_${bufferToHex(new Uint8Array(bits))}`;
}

export async function deriveProjectKey(apiKeyRaw: string, projectSalt: string): Promise<CryptoKey> {
  // apiKeyRaw is the hex portion after stripping "vault_" prefix
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(apiKeyRaw.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))),
    'HKDF',
    false,
    ['deriveKey'],
  );

  const saltBytes = new Uint8Array(projectSalt.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      salt: saltBytes,
      info: encoder.encode('encryption'),
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export function encodeBlob(blob: EncryptedBlob): string {
  return `${blob.iv}.${blob.ciphertext}`;
}

export function decodeBlob(encoded: string): EncryptedBlob {
  const [iv, ciphertext] = encoded.split('.');
  if (!iv || !ciphertext) throw new Error('Invalid encrypted blob format');
  return { iv, ciphertext };
}

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
