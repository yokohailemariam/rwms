export class ShiftEntity {
  id: string;
  tenantId: string;
  factoryId: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  overnightShift: boolean;
  color?: string;
  isActive: boolean;

  get label(): string {
    return `${this.name} (${this.startTime} - ${this.endTime})`;
  }

  isOvernight(): boolean {
    return this.overnightShift;
  }

  deactivate(): void {
    this.isActive = false;
  }
}
