import { Entity, PrimaryColumn, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn('uuid')
  roleId: string;

  @PrimaryColumn()
  permissionId: number;

  @ManyToOne('Role', 'rolePermissions')
  role: any;

  @ManyToOne('Permission', 'rolePermissions')
  permission: any;
  @CreateDateColumn()
  createdAt: Date;
}
