import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { OrganizationContextGuard } from 'src/common/guards/organization-context.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Organization-Id',
  description: 'Optional organization ID to operate in organization scope',
  required: false,
})
@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create a new project (Personal or Organization Scope)' })
  @ApiResponse({ status: 201, description: 'Project successfully created' })
  @Permissions('project.create')
  @Post()
  async create(@Request() req, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, req.organizationContext, dto);
  }

  @ApiOperation({ summary: 'Get all projects in the active scope (Personal or Organization)' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  @Permissions('project.read')
  @Get()
  async findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id, req.organizationContext);
  }

  @ApiOperation({ summary: 'Get a specific project details' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @Permissions('project.read')
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id, req.organizationContext);
  }

  @ApiOperation({ summary: 'Update a project (Personal or Organization Scope)' })
  @ApiResponse({ status: 200, description: 'Project successfully updated' })
  @Permissions('project.update')
  @Patch(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, req.user.id, req.organizationContext, dto);
  }

  @ApiOperation({ summary: 'Delete a project (Personal or Organization Scope)' })
  @ApiResponse({ status: 200, description: 'Project successfully deleted' })
  @Permissions('project.update')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id, req.organizationContext);
  }
}
