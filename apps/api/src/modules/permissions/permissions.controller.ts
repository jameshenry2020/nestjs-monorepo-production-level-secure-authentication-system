import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Create a new permission (Admin only)' })
  @ApiResponse({ status: 201, description: 'Permission successfully created' })
  @Roles('admin')
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @ApiOperation({ summary: 'List all permissions (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all permissions' })
  @Roles('admin')
  @Get()
  async findAll() {
    return this.permissionsService.findAll();
  }

  @ApiOperation({ summary: 'Assign permission(s) to a role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  @Roles('admin')
  @Post('roles/:roleId')
  async assignToRole(@Param('roleId') roleId: string, @Body() dto: AssignPermissionDto) {
    return this.permissionsService.assignPermissionsToRole(roleId, dto.permissions);
  }

  @ApiOperation({ summary: 'Remove permission(s) from a role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permissions removed successfully' })
  @Roles('admin')
  @Delete('roles/:roleId')
  async removeFromRole(@Param('roleId') roleId: string, @Body() dto: AssignPermissionDto) {
    return this.permissionsService.removePermissionsFromRole(roleId, dto.permissions);
  }

  @ApiOperation({ summary: 'Assign direct permission(s) to a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  @Roles('admin')
  @Post('users/:userId')
  async assignToUser(@Param('userId') userId: string, @Body() dto: AssignPermissionDto) {
    return this.permissionsService.assignPermissionsToUser(userId, dto.permissions);
  }

  @ApiOperation({ summary: 'Remove direct permission(s) from a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permissions removed successfully' })
  @Roles('admin')
  @Delete('users/:userId')
  async removeFromUser(@Param('userId') userId: string, @Body() dto: AssignPermissionDto) {
    return this.permissionsService.removePermissionsFromUser(userId, dto.permissions);
  }
}
