import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-1234-5678', description: 'The unique identifier of the user' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'The email address of the user' })
  email: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'The date and time the user was created' })
  createdAt: Date;
}