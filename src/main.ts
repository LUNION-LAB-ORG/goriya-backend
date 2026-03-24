import { AppModule } from './app.module';
import { RolesGuard } from './auth/roles.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    // CORS Authorization
    app.enableCors({
        origin: [
            'https://goriya-entreprise.vercel.app',
            'http://localhost:3000',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // accessible via http://backend/companies/xxx.png
    const staticPaths = [
        { path: '/tmp/uploads/companies', prefix: '/companies/' },
        { path: '/tmp/uploads/avatars', prefix: '/avatars/' },
    ];
    
    // ⚡ Servir les fichiers statiques correctement
    staticPaths.forEach(({ path, prefix }) => {
        app.useStaticAssets(path, { prefix });
    });

    const config = new DocumentBuilder()
        .setTitle('GORIYA APP API')
        .setDescription('Documentation de l’API backend')
        .setVersion('1.0').addBearerAuth() // pour JWT
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const reflector = app.get(Reflector);

    app.useGlobalGuards(
        new JwtAuthGuard(reflector),
        new RolesGuard(reflector),
    );

    await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
