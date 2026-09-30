const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function run() {
  const s3 = new S3Client({
    endpoint: 'http://localhost:8333',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'localadmin',
      secretAccessKey: 'localdevsecret'
    },
    forcePathStyle: true
  });

  const bucket = 'aifoundry-local';
  const key = `test-${Date.now()}.txt`;
  const body = 'Hello SeaweedFS';

  try {
    console.log('1. Uploading object...');
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
    console.log('✓ Upload successful');

    console.log('2. Presigned URL...');
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 });
    console.log('✓ URL:', url);

    console.log('3. Head Object...');
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log('✓ Size:', head.ContentLength);

    console.log('4. Delete Object...');
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log('✓ Delete successful');
    
    console.log('ALL STORAGE CONTRACT TESTS PASSED!');
  } catch (err) {
    console.error('FAILED:', err);
    process.exit(1);
  }
}
run();
