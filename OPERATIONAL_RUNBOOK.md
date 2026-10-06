# 📖 RyanAI Operational Runbook

**Version**: 1.0.0  
**Last Updated**: 2026-09-30  
**Status**: Operational guidance; production readiness has not been independently verified.

---

## 🚀 Daily Operations

### Morning Startup Check (5 min)

```bash
# 1. Verify all services
docker compose ps

# Expected output:
# NAME           STATUS    PORTS
# ryanai-api     Up        0.0.0.0:3000->3000/tcp
# ryanai-web     Up        0.0.0.0:9090->80/tcp
# ryanai-db      Up        5432/tcp
# ryanai-redis   Up        6379/tcp

# 2. Check system health
npm run docker:health

# 3. View recent logs
docker compose logs --tail=50

# 4. Verify endpoints
curl -s http://localhost:3000/health | jq
curl -s http://localhost:9090 | head -20

# 5. Check resource usage
docker stats --no-stream
```

### Evening Shutdown Check (5 min)

```bash
# 1. Graceful shutdown
docker compose down

# 2. Backup verification
ls -lh backups/

# 3. Log archival
tar -czf logs/archive/$(date +%Y%m%d).tar.gz logs/*.log

# 4. Disk space check
df -h

# 5. Services verification
docker compose ps  # Should show nothing running
```

---

## 🔧 Maintenance Tasks

### Weekly (Friday Evening)

```bash
# 1. Database maintenance
docker exec ryanai-db psql -U postgres -d ryanai -c "VACUUM ANALYZE;"

# 2. Cache cleanup
docker exec ryanai-redis redis-cli FLUSHALL --async

# 3. Log rotation
find logs/ -mtime +7 -delete

# 4. Performance report
docker stats --no-stream > reports/weekly-$(date +%Y%m%d).txt

# 5. Security audit
docker scan ryanai-api ryanai-web
```

### Monthly (First Friday)

```bash
# 1. Database backup verification
docker exec ryanai-db pg_dump -U postgres ryanai > backups/ryanai-$(date +%Y%m%d).sql

# 2. Docker image cleanup
docker image prune -a --force

# 3. Volume inspection
docker volume ls
docker volume inspect pgdata redisdata

# 4. Update base images
docker pull postgres:16
docker pull redis:7-alpine
docker pull node:22-alpine

# 5. Full system test
npm run test:integration
npm run test:e2e
```

### Quarterly (First Week)

```bash
# 1. Disaster recovery drill
# - Stop all services
# - Restore from backup
# - Verify data integrity
# - Measure RTO/RPO

# 2. Security assessment
npm audit
docker scan ryanai-api
docker scan ryanai-web

# 3. Performance baseline
# - Load test
# - Latency profiling
# - Resource utilization

# 4. Documentation update
# - Update runbooks
# - Review change logs
# - Update architecture docs

# 5. Team training
# - Incident response drill
# - Escalation procedures
# - Tools training
```

---

## 🚨 Incident Response

### Service Down

**Symptoms**: API/Web/DB not responding

**Response**:
```bash
# 1. Immediate assessment (1 min)
docker compose ps                          # Check service status
docker compose logs --tail=100             # View recent logs

# 2. Diagnostic (2 min)
curl -v http://localhost:3000/health
docker exec ryanai-db pg_isready
docker exec ryanai-redis redis-cli ping

# 3. Recovery attempt (5 min)
docker compose restart ryanai-api           # Restart single service
docker compose restart                      # Restart all services

# 4. If still down (10 min)
docker compose down -v                     # Full reset
docker compose up -d                       # Clean start

# 5. Post-incident (30 min)
docker compose logs > incidents/$(date +%Y%m%d-%H%M%S).log
npm run test:integration                    # Verify recovery
```

**Escalation**:
- If service doesn't recover in 15 min → Page on-call team
- If data loss possible → Activate disaster recovery

### High Latency

**Symptoms**: Response times > 500ms, p99 > 2s

**Response**:
```bash
# 1. Identify bottleneck (5 min)
curl http://localhost:3000/api/metrics | jq .
docker stats --no-stream                    # Check CPU/Memory
docker exec ryanai-db psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# 2. Common causes
# - Database connection pool exhausted
# - Redis memory limit hit
# - CPU throttling
# - Network saturation

# 3. Quick fixes
docker exec ryanai-redis redis-cli FLUSHALL      # Clear cache
docker compose restart ryanai-api               # Restart API
docker compose restart ryanai-db                # Restart DB

# 4. Monitor improvement
watch -n1 'curl -s http://localhost:3000/api/metrics | jq .latency'
```

**Escalation**:
- If latency persists > 30 min → Scale up resources
- If database locked → Investigate queries

### Database Issues

**Symptoms**: Connection errors, query timeouts, data inconsistency

**Response**:
```bash
# 1. Check database health (1 min)
docker exec ryanai-db psql -U postgres -d ryanai -c "SELECT version();"
docker exec ryanai-db pg_isready -v

# 2. Check connections (2 min)
docker exec ryanai-db psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 3. Verify disk space (1 min)
docker exec ryanai-db df -h

# 4. Common fixes
# - Kill idle connections: SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '10 min';
# - Restart service: docker compose restart ryanai-db
# - Restore from backup (if corrupted)

# 5. Run migrations
npm run db:setup
npm run db:migrate
```

**Escalation**:
- If database won't start → Check logs for corruption
- If data loss suspected → Restore from backup

### Cache Issues

**Symptoms**: Cache misses, memory errors, slow performance

**Response**:
```bash
# 1. Check Redis health (1 min)
docker exec ryanai-redis redis-cli INFO stats
docker exec ryanai-redis redis-cli INFO memory

# 2. Check size (1 min)
docker exec ryanai-redis redis-cli DBSIZE
docker exec ryanai-redis redis-cli INFO used_memory

# 3. Clear cache if needed
docker exec ryanai-redis redis-cli FLUSHALL     # DANGER: Clears all data
docker exec ryanai-redis redis-cli FLUSHDB      # Safer: Current DB only

# 4. Monitor recovery
watch -n1 'docker exec ryanai-redis redis-cli INFO stats'

# 5. Restart if persistent
docker compose restart ryanai-redis
```

**Escalation**:
- If Redis won't start → Check persistence files
- If memory leak → Investigate application cache usage

---

## 📊 Monitoring & Metrics

### Key Metrics to Monitor

```bash
# API Performance
curl http://localhost:3000/api/metrics | jq '{
  latency_p50: .latency.p50,
  latency_p99: .latency.p99,
  error_rate: .errors.rate,
  requests_per_sec: .throughput
}'

# Database Performance
docker exec ryanai-db psql -U postgres -c "SELECT 
  datname,
  numbackends,
  blks_hit / (blks_hit + blks_read) * 100 as cache_hit_ratio
FROM pg_stat_database WHERE datname = 'ryanai';"

# Cache Performance
docker exec ryanai-redis redis-cli INFO stats | grep -E "hits|misses"

# System Resources
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Response Time (p99) | >500ms | >2s | Investigate DB/Cache |
| Error Rate | >0.5% | >2% | Page on-call |
| CPU Usage | >70% | >90% | Scale up or optimize |
| Memory Usage | >75% | >90% | Restart service |
| Disk Space | <20% | <10% | Archive logs/cleanup |
| DB Connections | >80 | >95 | Check for leaks |

---

## 🔄 Deployment Procedures

### Deployment Checklist

**Pre-Deployment** (1 hour before):
- [ ] Code review completed
- [ ] Tests passing: `npm run validate`
- [ ] Security scan clean: `npm audit`
- [ ] Staging deployment successful
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Team notified
- [ ] Maintenance window scheduled

**Deployment** (During):
- [ ] Create pre-deployment backup: `docker exec ryanai-db pg_dump -U postgres ryanai > backup.sql`
- [ ] Build images: `docker compose build --no-cache`
- [ ] Deploy to staging first
- [ ] Run smoke tests: `npm run test:e2e`
- [ ] Deploy to production: `docker compose up -d`
- [ ] Verify all health checks: `npm run docker:health`
- [ ] Monitor error rates for 30 min
- [ ] Verify API endpoints
- [ ] Notify team of successful deployment

**Post-Deployment** (After):
- [ ] Confirm all services healthy
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Document any issues
- [ ] Update deployment log
- [ ] Notify stakeholders

### Rollback Procedure

If issues detected post-deployment:

```bash
# 1. Stop new version
docker compose down

# 2. Restore database backup
docker exec ryanai-db psql -U postgres -f backup.sql

# 3. Revert to previous image
# Change docker-compose.yml to use previous tag
docker compose up -d

# 4. Verify rollback
npm run docker:health
npm run test:e2e

# 5. Post-mortem
# - Document issue
# - Analyze logs
# - Identify root cause
# - Plan fix
```

---

## 📋 Log Analysis

### Common Log Patterns

```bash
# Database connection pool exhausted
docker compose logs ryanai-api | grep "connection pool exhausted"

# Memory issues
docker compose logs | grep -i "out of memory"

# Authentication failures
docker compose logs | grep -i "unauthorized\|forbidden"

# Rate limiting
docker compose logs | grep "rate limit"

# WebSocket errors
docker compose logs | grep "websocket\|ws://"
```

### Log Rotation

```bash
# Compress old logs
find logs/ -mtime +7 -exec gzip {} \;

# Archive monthly
tar -czf archive/logs-$(date +%Y-%m).tar.gz logs/

# Cleanup
find archive/ -mtime +30 -delete
```

---

## 📞 Escalation Matrix

| Issue | Response Time | Escalation | Contact |
|-------|---|---|---|
| Service Down | 5 min | P1 | On-call Engineer |
| High Latency | 15 min | P2 | DevOps Team |
| Data Loss Risk | 2 min | P1 | Engineering Lead |
| Security Issue | 1 min | P0 | Security Team |
| Performance Degradation | 30 min | P3 | Platform Team |

---

## 🆘 Emergency Contacts

- **On-Call Engineer**: [Phone/Slack]
- **DevOps Lead**: [Phone/Slack]
- **Database Admin**: [Phone/Slack]
- **Security Team**: [Phone/Slack]
- **Platform Lead**: [Phone/Slack]

---

## 📚 Additional Resources

- Architecture: `INTEGRATION.md`
- Configuration: `PRODUCTION_CONFIG.js`
- Scripts: `SCRIPTS_REFERENCE.md`
- Deployment: `README.md`

---

**Last Updated**: 2026-09-30  
**Next Review**: 2026-10-30
