import type { NestExpressApplication } from "@nestjs/platform-express";
// import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { patchNestJsSwagger } from "nestjs-zod";
// import * as session from "express-session";
import { AppModule } from "./app.module";

// import { MAX_AGE } from "./constants/session";

async function bootstrap() {
  patchNestJsSwagger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set("query parser", "extended");

  app.enableCors();
  // app.setGlobalPrefix("/v1/api");
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   })
  // );

  // app.use(
  //   session({
  //     secret: String(process.env.SESSION_SECRET),
  //     saveUninitialized: false,
  //     resave: false,
  //     cookie: {
  //       maxAge: MAX_AGE,
  //     },
  //   })
  // );
  //swagger config
  const config = new DocumentBuilder()
    .setTitle("Caisce Documentation")
    .setDescription("The caisce API description")
    .setVersion("1.0")
    .addTag("docs")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
