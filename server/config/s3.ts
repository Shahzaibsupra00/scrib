import { S3Client } from '@aws-sdk/client-s3';
import { logger } from './logger.js';

const S3_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_ENDPOINT = process.env.S3_CUSTOM_ENDPOINT || undefined; // For local MinIO tests if needed

// Initialize stable S3 Client using local credentials, defaulting safely to AWS IAM Roles/ECS Tasks
export const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // When undefined, AWS SDK defaults to IAM Instance Profile, ECS Task role, or ~/.aws/credentials automatically.
});

export const s3Config = {
  bucketName: process.env.AWS_S3_BUCKET_NAME || 'scribestone-assets-bucket',
  region: S3_REGION,
};

logger.info('AWS S3 initialized with standard credential configurations', {
  bucket: s3Config.bucketName,
  region: s3Config.region,
  usingCustomEndpoint: !!S3_ENDPOINT,
});
