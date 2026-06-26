import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userId: string, context: any, dto: CreateProjectDto) {
    if (context && context.type === 'ORGANIZATION') {
      return this.databaseService.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          organizationId: context.organizationId,
        },
      });
    } else {
      return this.databaseService.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          userId,
        },
      });
    }
  }

  async findAll(userId: string, context: any) {
    if (context && context.type === 'ORGANIZATION') {
      return this.databaseService.project.findMany({
        where: {
          organizationId: context.organizationId,
        },
      });
    } else {
      return this.databaseService.project.findMany({
        where: {
          userId,
          organizationId: null,
        },
      });
    }
  }

  async findOne(id: string, userId: string, context: any) {
    const project = await this.databaseService.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (context && context.type === 'ORGANIZATION') {
      if (project.organizationId !== context.organizationId) {
        throw new ForbiddenException('You do not have access to this project');
      }
    } else {
      if (project.userId !== userId || project.organizationId !== null) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    return project;
  }

  async update(id: string, userId: string, context: any, dto: UpdateProjectDto) {
    // Reuses findOne to perform permission and existence checks
    await this.findOne(id, userId, context);

    return this.databaseService.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async remove(id: string, userId: string, context: any) {
    // Reuses findOne to perform permission and existence checks
    await this.findOne(id, userId, context);

    return this.databaseService.project.delete({
      where: { id },
    });
  }
}
