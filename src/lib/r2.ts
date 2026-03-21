import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function getR2(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

function getBucket(): string {
  return process.env.R2_BUCKET_NAME!
}

export function generateDocKey(profileId: string, docTypeSlug: string, filename: string): string {
  const ext = filename.split('.').pop() ?? 'bin'
  const rand = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(8))).toString('hex')
  return `docs/${profileId}/${docTypeSlug}/${rand}.${ext}`
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  await getR2().send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
    ServerSideEncryption: 'AES256',
  }))
  return key
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 900): Promise<string> {
  return getSignedUrl(getR2(), new GetObjectCommand({ Bucket: getBucket(), Key: key }), { expiresIn })
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(getR2(), new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  }), { expiresIn })
}

export async function deleteFromR2(key: string): Promise<void> {
  await getR2().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }))
}

export async function hashBuffer(buf: Buffer): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer)
  return Buffer.from(digest).toString('hex')
}
