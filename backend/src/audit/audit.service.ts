import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(params: {
    action: string;
    userId?: string;
    ip?: string;
    details?: any;
    success?: boolean;
  }) {
    const audit = this.auditRepository.create(params);
    return this.auditRepository.save(audit);
  }
}
