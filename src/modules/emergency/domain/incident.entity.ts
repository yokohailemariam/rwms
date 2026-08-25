export class IncidentEntity {
  id: string;
  tenantId: string;
  factoryId: string;
  title: string;
  description: string;
  severity: string; // LOW | MEDIUM | HIGH | CRITICAL
  status: string; // OPEN | INVESTIGATING | RESOLVED | CLOSED
  reportedBy: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  latitude?: number;
  longitude?: number;
  affectedWorkers: number;

  isCritical(): boolean {
    return this.severity === 'CRITICAL';
  }

  resolve(resolvedBy: string, notes?: string): void {
    this.status = 'RESOLVED';
    this.resolvedBy = resolvedBy;
    this.resolvedAt = new Date();
    this.resolutionNotes = notes;
  }
}
