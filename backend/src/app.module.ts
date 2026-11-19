import { CluesModule } from './clues/clues.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { MatchesModule } from './matches/matches.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CluesModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: Number(configService.get<string>('DB_PORT') ?? 5433),
        username: configService.get<string>('DB_USERNAME') ?? 'postgres',
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE') ?? 'waypet_home',
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNC') === 'true',
        ssl: configService.get<string>('NODE_ENV') === 'production',
      }),
    }),
    AuthModule,
    ReportsModule,
    MatchesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Interceptor global: registra cada petición HTTP (ver logging.interceptor.ts)
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}