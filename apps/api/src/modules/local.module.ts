import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { ProjectsModule } from "./projects/projects.module";

@Module({
    imports: [AuthModule, UsersModule, PermissionsModule, OrganizationsModule, ProjectsModule],
    providers:[],
    exports: []
})
export class LocalModules {

}