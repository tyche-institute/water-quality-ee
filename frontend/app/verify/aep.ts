// .aep verification helpers for the /verify page.
//
// Supported bundle families:
// 1. Official Aletheia evidence packages:
//    response.txt, canonical.bin, hash.sha256, signature.sig, timestamp.tsr,
//    metadata.json, public_key.pem, optional signature_pqc.sig,
//    pqc_public_key.pem, pqc_algorithm.json
// 2. Legacy local_dev snapshot bundles used by this repo before the
//    backend evidence download path was wired.
// 3. Legacy backend self-bundled snapshot bundles used during the transition
//    period; these remain integrity-only because they lack public_key.pem.

type ZipEntry = { name: string; data: Uint8Array };

const OFFICIAL_REQUIRED = [
  "response.txt",
  "canonical.bin",
  "hash.sha256",
  "signature.sig",
  "timestamp.tsr",
  "metadata.json",
  "public_key.pem",
] as const;

const CLAIM_BOUNDARY = new TextEncoder().encode('\n{"claim":"');

function readUint32LE(buf: Uint8Array, offset: number): number {
  return (
    buf[offset] |
    (buf[offset + 1] << 8) |
    (buf[offset + 2] << 16) |
    (buf[offset + 3] * 0x1000000)
  );
}

function readUint16LE(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8);
}

function findLastSignature(buf: Uint8Array, signature: number): number {
  for (let offset = buf.length - 4; offset >= 0; offset--) {
    if (readUint32LE(buf, offset) === signature) return offset;
  }
  return -1;
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate-raw" as unknown as CompressionFormat);
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function inflateStoredEntry(
  compressionMethod: number,
  raw: Uint8Array,
  uncompressedSize: number,
  name: string,
): Promise<Uint8Array> {
  if (compressionMethod === 0) {
    return raw.slice(0, uncompressedSize);
  }
  if (compressionMethod === 8) {
    return inflateRaw(raw);
  }
  throw new Error(`Unsupported zip compression method ${compressionMethod} for ${name}`);
}

async function readAepFromCentralDirectory(bytes: Uint8Array): Promise<Record<string, Uint8Array>> {
  const eocdOffset = findLastSignature(bytes, 0x06054b50);
  if (eocdOffset < 0) throw new Error("ZIP end of central directory not found");

  const totalEntries = readUint16LE(bytes, eocdOffset + 10);
  const centralDirectoryOffset = readUint32LE(bytes, eocdOffset + 16);
  let offset = centralDirectoryOffset;
  const out: Record<string, Uint8Array> = {};

  for (let index = 0; index < totalEntries; index++) {
    const centralSig = readUint32LE(bytes, offset);
    if (centralSig !== 0x02014b50) {
      throw new Error(`central directory entry ${index} has invalid signature 0x${centralSig.toString(16)}`);
    }
    const compressionMethod = readUint16LE(bytes, offset + 10);
    const compressedSize = readUint32LE(bytes, offset + 20);
    const uncompressedSize = readUint32LE(bytes, offset + 24);
    const nameLen = readUint16LE(bytes, offset + 28);
    const extraLen = readUint16LE(bytes, offset + 30);
    const commentLen = readUint16LE(bytes, offset + 32);
    const localHeaderOffset = readUint32LE(bytes, offset + 42);
    const nameStart = offset + 46;
    const name = new TextDecoder("utf-8").decode(bytes.subarray(nameStart, nameStart + nameLen));

    const localSig = readUint32LE(bytes, localHeaderOffset);
    if (localSig !== 0x04034b50) {
      throw new Error(`local header for ${name} has invalid signature 0x${localSig.toString(16)}`);
    }
    const localNameLen = readUint16LE(bytes, localHeaderOffset + 26);
    const localExtraLen = readUint16LE(bytes, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const raw = bytes.subarray(dataStart, dataStart + compressedSize);
    out[name] = await inflateStoredEntry(compressionMethod, raw, uncompressedSize, name);

    offset = nameStart + nameLen + extraLen + commentLen;
  }

  return out;
}

async function readAepFromLocalHeaders(bytes: Uint8Array): Promise<Record<string, Uint8Array>> {
  const entries: ZipEntry[] = [];
  let offset = 0;
  while (offset + 4 <= bytes.length) {
    const sig = readUint32LE(bytes, offset);
    if (sig !== 0x04034b50) break;
    const compressionMethod = readUint16LE(bytes, offset + 8);
    const compressedSize = readUint32LE(bytes, offset + 18);
    const uncompressedSize = readUint32LE(bytes, offset + 22);
    const nameLen = readUint16LE(bytes, offset + 26);
    const extraLen = readUint16LE(bytes, offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const name = new TextDecoder("utf-8").decode(bytes.subarray(nameStart, nameStart + nameLen));
    const raw = bytes.subarray(dataStart, dataStart + compressedSize);
    const data = await inflateStoredEntry(compressionMethod, raw, uncompressedSize, name);
    entries.push({ name, data });
    offset = dataStart + compressedSize;
  }
  const out: Record<string, Uint8Array> = {};
  for (const entry of entries) out[entry.name] = entry.data;
  return out;
}

export async function readAep(buffer: ArrayBuffer): Promise<Record<string, Uint8Array>> {
  const bytes = new Uint8Array(buffer);
  try {
    return await readAepFromCentralDirectory(bytes);
  } catch (centralDirectoryError) {
    const fallback = await readAepFromLocalHeaders(bytes);
    if (Object.keys(fallback).length > 0) return fallback;
    throw centralDirectoryError;
  }
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data as BufferSource);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64.trim());
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function pemToDer(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");
  return base64ToBytes(b64);
}

function readDerLength(bytes: Uint8Array, offset: number): { length: number; next: number } {
  const first = bytes[offset];
  if (first < 0x80) return { length: first, next: offset + 1 };
  const count = first & 0x7f;
  let value = 0;
  for (let i = 0; i < count; i++) value = (value << 8) | bytes[offset + 1 + i];
  return { length: value, next: offset + 1 + count };
}

function readDerElement(bytes: Uint8Array, offset: number): { tag: number; start: number; end: number; next: number } {
  const tag = bytes[offset];
  const { length, next } = readDerLength(bytes, offset + 1);
  return { tag, start: next, end: next + length, next: next + length };
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  const hex = bytesToHex(bytes);
  if (hex.length === 0) return 0n;
  return BigInt(`0x${hex}`);
}

function bigIntToBytes(value: bigint, size: number): Uint8Array {
  const out = new Uint8Array(size);
  let x = value;
  for (let i = size - 1; i >= 0; i--) {
    out[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return out;
}

function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  let b = base % modulus;
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % modulus;
    e >>= 1n;
    b = (b * b) % modulus;
  }
  return result;
}

function parseRsaPublicKeyPem(pem: string): { modulus: bigint; exponent: bigint; modulusBytes: number } {
  const der = pemToDer(pem);
  const outer = readDerElement(der, 0);
  if (outer.tag !== 0x30) throw new Error("public_key.pem is not a DER sequence");

  const algorithm = readDerElement(der, outer.start);
  const bitString = readDerElement(der, algorithm.next);
  if (bitString.tag !== 0x03) throw new Error("public_key.pem is not an SPKI bit string");

  const bitStringPayload = der.subarray(bitString.start + 1, bitString.end);
  const rsaSeq = readDerElement(bitStringPayload, 0);
  if (rsaSeq.tag !== 0x30) throw new Error("public_key.pem does not contain an RSA public key");

  const modulusEl = readDerElement(bitStringPayload, rsaSeq.start);
  const exponentEl = readDerElement(bitStringPayload, modulusEl.next);
  if (modulusEl.tag !== 0x02 || exponentEl.tag !== 0x02) {
    throw new Error("public_key.pem is missing RSA modulus/exponent");
  }

  let modulusBytes = bitStringPayload.subarray(modulusEl.start, modulusEl.end);
  if (modulusBytes[0] === 0) modulusBytes = modulusBytes.subarray(1);
  const exponentBytes = bitStringPayload.subarray(exponentEl.start, exponentEl.end);
  return {
    modulus: bytesToBigInt(modulusBytes),
    exponent: bytesToBigInt(exponentBytes),
    modulusBytes: modulusBytes.length,
  };
}

function recoverRsaDigest(publicKeyPem: string, signatureBytes: Uint8Array): Uint8Array {
  const { modulus, exponent, modulusBytes } = parseRsaPublicKeyPem(publicKeyPem);
  if (signatureBytes.length !== modulusBytes) {
    throw new Error(`signature length ${signatureBytes.length} does not match modulus size ${modulusBytes}`);
  }
  const c = bytesToBigInt(signatureBytes);
  const m = modPow(c, exponent, modulus);
  const mBytes = bigIntToBytes(m, modulusBytes);
  if (mBytes.length < 11 || mBytes[0] !== 0x00 || mBytes[1] !== 0x01) {
    throw new Error("signature does not use PKCS#1 v1.5 padding");
  }
  let sep = -1;
  for (let i = 2; i < mBytes.length; i++) {
    if (mBytes[i] === 0x00) {
      sep = i;
      break;
    }
  }
  if (sep < 0) throw new Error("PKCS#1 v1.5 padding terminator not found");
  const digestInfo = mBytes.subarray(sep + 1);
  if (digestInfo.length < 32) throw new Error(`recovered DigestInfo too short (${digestInfo.length} bytes)`);
  return digestInfo.subarray(digestInfo.length - 32);
}

function findLastBoundary(bytes: Uint8Array, needle: Uint8Array): number {
  outer: for (let i = bytes.length - needle.length; i >= 0; i--) {
    for (let j = 0; j < needle.length; j++) {
      if (bytes[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

async function resolveCanonicalPrefix(canonical: Uint8Array, expectedHash: string): Promise<{ prefix: Uint8Array; computedHash: string }> {
  const fullHash = await sha256Hex(canonical);
  if (fullHash === expectedHash) {
    return { prefix: canonical, computedHash: fullHash };
  }
  const boundary = findLastBoundary(canonical, CLAIM_BOUNDARY);
  if (boundary > 0) {
    const prefix = canonical.subarray(0, boundary);
    return { prefix, computedHash: await sha256Hex(prefix) };
  }
  return { prefix: canonical, computedHash: fullHash };
}

function parseJsonEntry(entries: Record<string, Uint8Array>, name: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder("utf-8").decode(entries[name])) as Record<string, unknown>;
}

function normalizeOfficialManifest(
  metadata: Record<string, unknown>,
  entries: Record<string, Uint8Array>,
): Record<string, unknown> {
  let pqcAlgorithm = "";
  if (entries["pqc_algorithm.json"]) {
    try {
      const algo = parseJsonEntry(entries, "pqc_algorithm.json");
      pqcAlgorithm = String(algo.algorithm ?? algo.parameter_set ?? "ML-DSA-65");
    } catch {
      pqcAlgorithm = "ML-DSA-65";
    }
  }
  return {
    signed_at: metadata.created_at ?? "",
    algorithm: "RSASSA-PKCS1-v1_5-SHA256",
    mode: "backend",
    pqc_signature_included: Boolean(entries["signature_pqc.sig"]),
    pqc_algorithm: pqcAlgorithm || undefined,
    rsa_legacy_signature_included: Boolean(entries["signature.sig"]),
    aletheia_uuid: metadata.aletheia_uuid ?? metadata.uuid ?? "",
    agent_id: metadata.agent_id ?? "",
    response_id: metadata.response_id,
  };
}

export type VerifyResult = {
  ok: boolean;
  verificationLevel?: "cryptographic" | "integrity";
  reason: string;
  manifest?: Record<string, unknown>;
  payloadDigest?: string;
  expectedDigest?: string;
  payload?: unknown;
};

async function verifyOfficialEvidence(entries: Record<string, Uint8Array>): Promise<VerifyResult> {
  for (const name of OFFICIAL_REQUIRED) {
    if (!entries[name]) return { ok: false, reason: `missing entry: ${name}` };
  }

  const canonical = entries["canonical.bin"];
  const expectedHash = new TextDecoder("utf-8").decode(entries["hash.sha256"]).trim();
  const { computedHash } = await resolveCanonicalPrefix(canonical, expectedHash);
  if (computedHash !== expectedHash) {
    return {
      ok: false,
      reason: "hash mismatch (response was tampered with)",
      payloadDigest: computedHash,
      expectedDigest: expectedHash,
      manifest: normalizeOfficialManifest(parseJsonEntry(entries, "metadata.json"), entries),
    };
  }

  const signatureB64 = new TextDecoder("utf-8").decode(entries["signature.sig"]).trim();
  if (!signatureB64) {
    return { ok: false, reason: "signature.sig is empty", manifest: normalizeOfficialManifest(parseJsonEntry(entries, "metadata.json"), entries) };
  }

  const publicKeyPem = new TextDecoder("utf-8").decode(entries["public_key.pem"]);
  const signatureBytes = base64ToBytes(signatureB64);
  let recoveredDigest: Uint8Array;
  try {
    recoveredDigest = recoverRsaDigest(publicKeyPem, signatureBytes);
  } catch (e) {
    return {
      ok: false,
      reason: `RSA verification failed: ${(e as Error).message}`,
      payloadDigest: expectedHash,
      manifest: normalizeOfficialManifest(parseJsonEntry(entries, "metadata.json"), entries),
    };
  }

  if (bytesToHex(recoveredDigest) !== expectedHash) {
    return {
      ok: false,
      reason: "signature does not match the recorded hash",
      payloadDigest: bytesToHex(recoveredDigest),
      expectedDigest: expectedHash,
      manifest: normalizeOfficialManifest(parseJsonEntry(entries, "metadata.json"), entries),
    };
  }

  const tsaToken = new TextDecoder("utf-8").decode(entries["timestamp.tsr"]).trim();
  if (!tsaToken) {
    return {
      ok: false,
      reason: "timestamp.tsr is empty",
      payloadDigest: expectedHash,
      manifest: normalizeOfficialManifest(parseJsonEntry(entries, "metadata.json"), entries),
    };
  }

  const metadata = parseJsonEntry(entries, "metadata.json");
  const manifest = normalizeOfficialManifest(metadata, entries);
  return {
    ok: true,
    verificationLevel: "cryptographic",
    reason: "signature and hash verified against public_key.pem; timestamp token is present",
    manifest,
    payloadDigest: expectedHash,
    expectedDigest: expectedHash,
    payload: (() => {
      try {
        return JSON.parse(new TextDecoder("utf-8").decode(entries["response.txt"]));
      } catch {
        return undefined;
      }
    })(),
  };
}

async function verifyLegacySnapshot(entries: Record<string, Uint8Array>): Promise<VerifyResult> {
  const required = ["payload.json", "manifest.json", "signature.b64"];
  for (const name of required) {
    if (!entries[name]) return { ok: false, reason: `missing entry: ${name}` };
  }

  const payload = entries["payload.json"];
  const manifest = parseJsonEntry(entries, "manifest.json");
  const mode = String(manifest.mode ?? "");

  if (mode === "backend") {
    if (!entries["signed_manifest.json"]) {
      return { ok: false, reason: "missing entry: signed_manifest.json (required for backend mode)", manifest };
    }
    const signedManifestBytes = entries["signed_manifest.json"];
    const signedManifest = parseJsonEntry(entries, "signed_manifest.json");

    const payloadDigest = await sha256Hex(payload);
    const expectedPayloadDigest = String(signedManifest.snapshot_sha256 ?? "");
    if (payloadDigest !== expectedPayloadDigest) {
      return {
        ok: false,
        reason: "digest mismatch (tampered payload vs signed attestation)",
        manifest,
        payloadDigest,
        expectedDigest: expectedPayloadDigest,
      };
    }

    const signedManifestDigest = await sha256Hex(signedManifestBytes);
    const expectedSignedManifestDigest = String(manifest.signed_manifest_sha256 ?? "");
    if (expectedSignedManifestDigest && signedManifestDigest !== expectedSignedManifestDigest) {
      return {
        ok: false,
        reason: "signed_manifest.json digest mismatch (tampered attestation)",
        manifest,
        payloadDigest: signedManifestDigest,
        expectedDigest: expectedSignedManifestDigest,
      };
    }

    return {
      ok: true,
      verificationLevel: "integrity",
      reason: "legacy bundle: integrity chain verified; this format predates the official evidence package and cannot fully verify the backend signature offline",
      manifest,
      payloadDigest,
      expectedDigest: expectedPayloadDigest,
      payload: (() => {
        try {
          return JSON.parse(new TextDecoder("utf-8").decode(payload));
        } catch {
          return undefined;
        }
      })(),
    };
  }

  const expected = String(manifest.payload_digest_sha256 ?? "");
  const actual = await sha256Hex(payload);
  if (expected !== actual) {
    return {
      ok: false,
      reason: "digest mismatch (tampered payload)",
      manifest,
      payloadDigest: actual,
      expectedDigest: expected,
    };
  }

  if (!entries["pubkey_spki.der"]) {
    return { ok: false, reason: "missing entry: pubkey_spki.der (required for local_dev bundles)", manifest };
  }

  const signatureBytes = base64ToBytes(new TextDecoder("utf-8").decode(entries["signature.b64"]));
  const spki = entries["pubkey_spki.der"];

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "spki",
      spki as BufferSource,
      { name: "RSA-PSS", hash: "SHA-256" },
      true,
      ["verify"],
    );
  } catch (e) {
    return { ok: false, reason: `public key import failed: ${(e as Error).message}`, manifest };
  }

  const keyBits = (key.algorithm as RsaHashedKeyAlgorithm).modulusLength;
  const saltLength = Math.max(0, Math.floor(keyBits / 8) - 32 - 2);
  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength },
      key,
      signatureBytes as BufferSource,
      payload as BufferSource,
    );
  } catch (e) {
    return { ok: false, reason: `signature verify threw: ${(e as Error).message}`, manifest };
  }
  if (!valid) {
    return { ok: false, reason: "signature invalid", manifest, payloadDigest: actual };
  }

  return {
    ok: true,
    verificationLevel: "cryptographic",
    reason: "ok",
    manifest,
    payloadDigest: actual,
    expectedDigest: expected,
    payload: (() => {
      try {
        return JSON.parse(new TextDecoder("utf-8").decode(payload));
      } catch {
        return undefined;
      }
    })(),
  };
}

export async function verifyAep(buffer: ArrayBuffer): Promise<VerifyResult> {
  let entries: Record<string, Uint8Array>;
  try {
    entries = await readAep(buffer);
  } catch (e) {
    return { ok: false, reason: `bundle malformed: ${(e as Error).message}` };
  }

  if (entries["public_key.pem"] && entries["canonical.bin"] && entries["hash.sha256"]) {
    return verifyOfficialEvidence(entries);
  }
  return verifyLegacySnapshot(entries);
}
