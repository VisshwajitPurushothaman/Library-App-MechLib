import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, user } = request;

    // Only audit mutations (POST, PUT, DELETE)
    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.auditService.log({
            action: `${method}_${url}`,
            userId: user?.id || 'anonymous',
            ip: ip || 'unknown',
            details: {
              path: url,
              method,
              // We could log body but be careful with passwords/PII
              // For now we just log the action
            },
            success: true,
          });
        },
        error: (err) => {
          this.auditService.log({
            action: `${method}_${url}`,
            userId: user?.id || 'anonymous',
            ip: ip || 'unknown',
            details: { path: url, method, error: err.message },
            success: false,
          });
        },
      }),
    );
  }
}
