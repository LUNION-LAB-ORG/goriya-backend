import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // whitelist: true retire les champs non déclarés sur les DTOs (protection mass-assignment).
    // forbidNonWhitelisted volontairement omis pour ne pas faire échouer les requêtes existantes
    // des 3 front-ends qui pourraient envoyer des champs superflus non encore nettoyés.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: [
            'https://goriya-entreprise.vercel.app', 
            'https://goriya-standard.vercel.app',
            'https://goriya-admin.vercel.app',
            'http://localhost:3000',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('GORIYA APP API')
        .setDescription('Documentation de l’API backend')
        .setVersion('1.0')
        .addBearerAuth() // pour JWT
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document);

    const reflector = app.get(Reflector);

    app.useGlobalGuards(
        new JwtAuthGuard(reflector),
        new RolesGuard(reflector),
    );

    await app.listen(process.env.PORT ?? 8081);
}
bootstrap();
