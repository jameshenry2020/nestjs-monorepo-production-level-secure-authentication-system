import { Configuration, RequiredArgsConstructor, Value } from '@itgorillaz/configify';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Configuration()
export class DatabaseConfiguration{
 @Value('DB_HOST')
  host: string;

  @Value('DB_USERNAME')
  user: string;

  @Value('DB_PASSWORD')
  password: string;

  @Value('DB_NAME')
  name: string

  @Value('DB_PORT', { parse: parseInt })
  port: number

  @Value('DATABASE_URL')
  database_url: string

}

@Configuration()
@RequiredArgsConstructor()
export class EmailConfiguration{

  @IsNotEmpty()
  @Value('EMAIL_HOST')
  host: string

  @IsNotEmpty()
  @Value('EMAIL_PASSWORD')
  password: string

  @IsNotEmpty()
  @Value('EMAIL_PORT', {parse: parseInt})
  port: number

  @IsNotEmpty()
  @Value('EMAIL_USER')
  user: string

  @IsNotEmpty()
  @Value('DEFAULT_FROM_EMAIL')
  fromEmail: string

  constructor(config: Required<EmailConfiguration>) {
    this.host = config.host;
    this.user = config.user;
    this.password = config.password;
    this.port = config.port;
    this.fromEmail = config.fromEmail
  }

}

@Configuration()
@RequiredArgsConstructor()
export class RedisConfiguration {
    @Value('REDIS_HOST')
    host: string

    @Value('REDIS_PORT', {parse: parseInt})
    port: number 

    constructor(config: Required<RedisConfiguration>) {
      this.host = config.host;
      this.port = config.port;
      
  }

}

@Configuration()
@RequiredArgsConstructor()
export class JwtConfiguration {
  @Value('JWT_SECRET')
  secret: string

  @Value('JWT_EXPIRE_IN', {parse: parseInt})
  expire: number 

  @Value('JWT_REFRESH_SECRET', { default: 'mUIlNifOEUOMomzmBUNDZc/rsSEbOLlMGv8YXjDQLfQ=_refresh' })
  refreshSecret: string

   constructor(config: Required<JwtConfiguration>) {
      this.secret = config.secret;
      this.expire = config.expire;
      this.refreshSecret = config.refreshSecret;
  }
}

@Configuration()
@RequiredArgsConstructor()
export class GoogleConfiguration {
  @Value('GOOGLE_CLIENT_ID')
  clientId: string

  @Value('GOOGLE_CLIENT_SECRET')
  clientSecret: string

  @Value('GOOGLE_CALLBACK_URL')
  callbackUrl: string

  constructor(config: Required<GoogleConfiguration>) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.callbackUrl = config.callbackUrl;
  }
}

@Configuration()
@RequiredArgsConstructor()
export class ServerConfiguration {
  @Value('SERVER_PASSWORD')
  serverPassword: string

  constructor(config: Required<ServerConfiguration>) {
    this.serverPassword = config.serverPassword;
  }
}