import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: [
            'https://goriya-entreprise.vercel.app', 
            'http://localhost:3000'
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
