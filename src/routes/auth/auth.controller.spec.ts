import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return a token when provided with valid credentials and a validated email', async () => {
      const loginDto = {
        email: 'edgarcresson@hotmail.com',
        password: 'ItachiUchiha2',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-api-key', process.env.API_KEY || '')
        .send(loginDto)
        .expect(201);

      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 Unauthorized when provided with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'incorrect_password',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-api-key', process.env.API_KEY || '')
        .send(loginDto)
        .expect(401);
    });

    it('should return 403 Forbidden when the email is not validated', async () => {
      const loginDto = {
        email: 'john@doe.com',
        password: process.env.ADMIN_PASSWORD,
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-api-key', process.env.API_KEY || '')
        .send(loginDto)
        .expect(403);
    });
  });
});
