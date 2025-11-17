const getServerUrl = () => {
  const port = process.env.PORT || 4000;
  return process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`;
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Deneyap Kütüphane API',
    version: '1.0.0',
    description:
      'Deneyap Atölyeleri için çok kiracılı kütüphane yönetimi. JWT bearer ile korunan REST uçları.',
  },
  servers: [
    {
      url: getServerUrl(),
    },
  ],
  tags: [
    { name: 'Auth', description: 'Giriş ve kullanıcı yönetimi' },
    { name: 'Resources', description: 'Kaynak CRUD işlemleri' },
    { name: 'Loans', description: 'Ödünç alma / iade' },
    { name: 'Reservations', description: 'Rezervasyon kuyruğu' },
    { name: 'Reports', description: 'Yönetici raporları' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@example.com' },
          password: { type: 'string', example: '123456' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['admin', 'student'] },
                },
              },
              token: { type: 'string' },
            },
          },
        },
      },
      ResourceInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
          topic: { type: 'string' },
          difficulty: { type: 'string', example: 'Beginner' },
          totalStock: { type: 'integer', minimum: 1, example: 3 },
          description: { type: 'string' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Kullanıcı girişi yap',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Başarılı giriş',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Geçersiz bilgiler' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Yeni kullanıcı kaydı (admin rolü opsiyonel)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/LoginRequest' },
                  {
                    type: 'object',
                    properties: {
                      fullName: { type: 'string' },
                      role: { type: 'string', enum: ['admin', 'student'] },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          201: { description: 'Kullanıcı oluşturuldu' },
        },
      },
    },
    '/api/resources': {
      get: {
        tags: ['Resources'],
        summary: 'Kaynak listesini getir',
        responses: {
          200: { description: 'Kaynak listesi' },
        },
      },
      post: {
        tags: ['Resources'],
        summary: 'Yeni kaynak ekle',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResourceInput' },
            },
          },
        },
        responses: {
          201: { description: 'Kaynak oluşturuldu' },
        },
      },
    },
    '/api/loans': {
      get: {
        tags: ['Loans'],
        summary: 'Ödünç kayıtlarını listele (admin)',
        responses: {
          200: { description: 'Ödünç listesi' },
        },
      },
      post: {
        tags: ['Loans'],
        summary: 'Ödünç alma isteği oluştur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resourceId', 'dueAt'],
                properties: {
                  resourceId: { type: 'string', format: 'uuid' },
                  dueAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Ödünç kaydı oluşturuldu' },
          409: { description: 'Stok yok' },
        },
      },
    },
    '/api/reservations': {
      get: {
        tags: ['Reservations'],
        summary: 'Rezervasyon kuyruğu (admin)',
        responses: {
          200: { description: 'Rezervasyon listesi' },
        },
      },
      post: {
        tags: ['Reservations'],
        summary: 'Rezervasyon oluştur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resourceId'],
                properties: {
                  resourceId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Rezervasyon kuyruğuna alındı' },
        },
      },
    },
    '/api/reports/overdue': {
      get: {
        tags: ['Reports'],
        summary: 'Süresi geçmiş ödünç kayıtlarını döner',
        responses: {
          200: { description: 'Rapor' },
        },
      },
    },
    '/api/reports/top-borrowed': {
      get: {
        tags: ['Reports'],
        summary: 'En çok ödünç alınan kaynaklar',
        responses: {
          200: { description: 'Rapor' },
        },
      },
    },
  },
};

export default swaggerSpec;

