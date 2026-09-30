import { StorageService } from './src/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { execSync } from 'child_process';

async function runTests() {
  console.log('--- STORAGE PROVIDER CONTRACT TEST ---');

  const mockConfig = {
    get: (key: string) => {
      const config: Record<string, string> = {
        'S3_ENDPOINT': 'http://localhost:8333',
        'S3_REGION': 'us-east-1',
        'S3_ACCESS_KEY_ID': 'localadmin',
        'S3_SECRET_ACCESS_KEY': 'localdevsecret',
        'S3_BUCKET': 'aifoundry-local',
        'S3_FORCE_PATH_STYLE': 'true'
      };
      return config[key];
    }
  } as unknown as ConfigService;

  const storage = new StorageService(mockConfig);
  await storage.onModuleInit();

  const testKey = `contract-test-${Date.now()}.txt`;
  const originalBuffer = Buffer.from('HelloWorld');
  const mimeType = 'text/plain';

  try {
    console.log('\n1. putObject & getObject + Byte Comparison');
    await storage.putObject(testKey, originalBuffer, mimeType);
    const readBuffer = await storage.getObject(testKey);
    if (!originalBuffer.equals(readBuffer)) throw new Error('Byte comparison failed!');
    console.log(' ✓ putObject success & getObject byte comparison passed.');

    console.log('\n2. exists (Head Object)');
    const doesExist = await storage.exists(testKey);
    if (!doesExist) throw new Error('exists returned false but should be true');
    const notExist = await storage.exists('random-non-existent-key');
    if (notExist) throw new Error('exists returned true but should be false');
    console.log(' ✓ exists() works correctly.');

    console.log('\n3. createPresignedGetUrl & Real HTTP GET');
    const getUrl = await storage.createPresignedGetUrl(testKey);
    const getRes = await axios.get(getUrl, { responseType: 'arraybuffer' });
    const getHttpBuffer = Buffer.from(getRes.data);
    if (!originalBuffer.equals(getHttpBuffer)) throw new Error('Presigned GET downloaded wrong content');
    console.log(' ✓ Presigned GET generated and HTTP download verified.');

    console.log('\n4. createPresignedPutUrl & Real HTTP PUT');
    const putKey = `contract-put-${Date.now()}.txt`;
    const putUrl = await storage.createPresignedPutUrl(putKey, mimeType);
    const putBuffer = Buffer.from('PresignedPutContent');
    await axios.put(putUrl, putBuffer, { headers: { 'Content-Type': mimeType } });
    const readPutBuffer = await storage.getObject(putKey);
    if (!putBuffer.equals(readPutBuffer)) throw new Error('Presigned PUT content mismatch');
    await storage.deleteObject(putKey); // Cleanup
    console.log(' ✓ Presigned PUT generated and HTTP upload verified.');

    console.log('\n5. Persistence Test (Restart Container)');
    // Restart seaweedfs container
    console.log('   Restarting aifoundry-s3 container...');
    execSync('docker restart aifoundry-s3');
    // Wait for it to be up
    await new Promise(r => setTimeout(r, 10000));
    // S3Client might hold broken socket, recreate it
    await storage.onModuleInit();
    const survives = await storage.exists(testKey);
    if (!survives) throw new Error('Object did not survive container restart!');
    const survivedBuffer = await storage.getObject(testKey);
    if (!originalBuffer.equals(survivedBuffer)) throw new Error('Survived content mismatch');
    console.log(' ✓ Object survived restart and contents match.');

    console.log('\n6. deleteObject & Real Absence Verification');
    await storage.deleteObject(testKey);
    const deletedExist = await storage.exists(testKey);
    if (deletedExist) throw new Error('exists returned true after deleteObject');
    console.log(' ✓ deleteObject works and absence verified.');

    console.log('\nALL STORAGE CONTRACT TESTS PASSED!');
    process.exit(0);

  } catch (err: any) {
    console.error('\nSTORAGE CONTRACT TEST FAILED:', err.message || err);
    process.exit(1);
  }
}

runTests();
