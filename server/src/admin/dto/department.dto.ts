import { DepartmentType } from '../enums/department.enum';

export class DepartmentDto {
  value: string;
  label: string;
}

export function getDepartments(): DepartmentDto[] {
  return Object.values(DepartmentType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));
}
