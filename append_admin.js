const fs = require('fs');

const serviceAppend = `

  async getAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, createdAt: true, isActive: true }
    });
  }

  async createAdmin(email, name) {
    const existing = await this.prisma.user.findFirst({ where: { email } });
    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN' }
      });
    }
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    return this.prisma.user.create({
      data: {
        email,
        name,
        username,
        displayUsername: username,
        role: 'ADMIN',
        isEmailVerified: true
      }
    });
  }
`;

const controllerAppend = `

  @Get('users')
  async getAdmins() {
    return this.adminService.getAdmins();
  }

  @Patch('users/create')
  async createAdmin(@Body() body) {
    return this.adminService.createAdmin(body.email, body.name);
  }
`;

const serviceFile = 'apps/api/src/admin/admin.service.ts';
let serviceContent = fs.readFileSync(serviceFile, 'utf8');
serviceContent = serviceContent.replace(/}\s*$/, serviceAppend + '\n}\n');
fs.writeFileSync(serviceFile, serviceContent);

const controllerFile = 'apps/api/src/admin/admin.controller.ts';
let controllerContent = fs.readFileSync(controllerFile, 'utf8');
controllerContent = controllerContent.replace(/}\s*$/, controllerAppend + '\n}\n');
fs.writeFileSync(controllerFile, controllerContent);
