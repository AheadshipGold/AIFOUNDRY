const fs = require('fs');
const file = 'apps/mobile/src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('CmsApi = {')) {
  content += `\nexport const CmsApi = {
  async getLandingConfig(): Promise<{ data: any }> {
    return request<{ data: any }>('/v1/cms/landing');
  }
};\n`;
  fs.writeFileSync(file, content);
  console.log('Added CmsApi to mobile API');
} else {
  console.log('CmsApi already exists in mobile API');
}
