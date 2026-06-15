import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization successfully created' })
  @Post()
  async create(@Request() req, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Get all organizations the current user belongs to' })
  @ApiResponse({ status: 200, description: 'List of user organizations' })
  @Get()
  async findAll(@Request() req) {
    return this.organizationsService.findAllForUser(req.user.id);
  }

  @ApiOperation({ summary: 'Get all members of an organization' })
  @ApiResponse({ status: 200, description: 'List of organization members' })
  @Get(':id/members')
  async findMembers(@Param('id') id: string, @Request() req) {
    return this.organizationsService.findMembers(id, req.user.id);
  }

  @ApiOperation({ summary: 'Invite a user to join an organization' })
  @ApiResponse({ status: 201, description: 'Invitation successfully created and sent' })
  @Post(':id/invitations')
  async invite(@Param('id') id: string, @Request() req, @Body() dto: InviteMemberDto) {
    return this.organizationsService.invite(req.user.id, id, dto.email);
  }

  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiResponse({ status: 201, description: 'Invitation successfully accepted' })
  @Post('invitations/:token/accept')
  async acceptInvite(@Param('token') token: string, @Request() req) {
    return this.organizationsService.acceptInvite(req.user.id, token);
  }

  @ApiOperation({ summary: 'Reject/Decline an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation successfully declined' })
  @Post('invitations/:token/reject')
  async rejectInvite(@Param('token') token: string, @Request() req) {
    return this.organizationsService.rejectInvite(req.user.id, token);
  }

  @ApiOperation({ summary: 'Update an organization member\'s role' })
  @ApiResponse({ status: 200, description: 'Role successfully updated' })
  @Put(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') orgId: string,
    @Param('userId') memberUserId: string,
    @Request() req,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.organizationsService.updateMemberRole(orgId, req.user.id, memberUserId, dto.roleName);
  }

  @ApiOperation({ summary: 'Remove a member or leave an organization' })
  @ApiResponse({ status: 200, description: 'Member successfully removed' })
  @Delete(':id/members/:userId')
  async removeMember(@Param('id') orgId: string, @Param('userId') memberUserId: string, @Request() req) {
    return this.organizationsService.removeMember(orgId, req.user.id, memberUserId);
  }
}
