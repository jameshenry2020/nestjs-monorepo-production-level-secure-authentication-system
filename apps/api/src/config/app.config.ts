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

    @Value('REDIS_PORT')
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

   constructor(config: Required<JwtConfiguration>) {
      this.secret = config.secret;
      this.expire = config.expire;
      
  }
}