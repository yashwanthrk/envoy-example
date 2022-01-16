const config = {
  accessKey: process.env.s3_access_key,
  secretKey: process.env.s3_secret_key,
  region: process.env.s3_region,
  bucketPrivate: process.env.s3_bucket_private,
  bucketPublic: process.env.s3_bucket_public,
};

module.exports = config;
