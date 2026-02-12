# Notification Service Status Report

**Date**: February 12, 2026  
**Status**: ⚠️ Running but Unhealthy (Expected in Development)

---

## 🔍 Issue Summary

The Notification Service is **running** but showing as **unhealthy** due to email configuration.

### Root Cause

The service health check includes a **Mail Health Indicator** that attempts to connect to Gmail SMTP:

```
jakarta.mail.AuthenticationFailedException: 535-5.7.8 Username and Password not accepted.
```

This is happening because:
1. No valid Gmail credentials are configured
2. The default environment variables use placeholder values
3. Gmail requires app-specific passwords (not regular passwords)

---

## ✅ Service Status

Despite the health check failure, the notification service is:

- ✅ **Running** - Container is up and operational
- ✅ **Connected to Kafka** - Can consume events
- ✅ **Connected to PostgreSQL** - Database connection working
- ✅ **Registered with Eureka** - Service discovery working
- ⚠️ **Mail Health Check Failing** - Cannot connect to SMTP server

---

## 🔧 Why This Happens

The Spring Boot Actuator health endpoint checks **all** configured health indicators:
- Database connectivity ✅
- Kafka connectivity ✅
- **Mail server connectivity** ❌ (causes overall health to be DOWN)

The mail health check fails because the docker-compose.yml uses default/placeholder values:

```yaml
MAIL_HOST: ${MAIL_HOST:-smtp.gmail.com}
MAIL_PORT: ${MAIL_PORT:-587}
MAIL_USERNAME: ${MAIL_USERNAME:-noreply@cloudforgetech.in}
MAIL_PASSWORD: ${MAIL_PASSWORD:-}  # Empty password
```

---

## 💡 Impact on Application

### What Still Works:
- ✅ Service can receive Kafka events
- ✅ Service can process notifications
- ✅ Service can store notification records in database
- ✅ All other microservices can communicate with it

### What Doesn't Work:
- ❌ Actual email sending (will fail when attempted)
- ❌ Health check endpoint returns 503

---

## 🛠️ Solutions

### Option 1: Configure Real Email Credentials (Production)

Create a `.env` file in `infrastructure/docker/`:

```env
# Gmail Configuration (requires App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
NOTIFICATION_FROM_EMAIL=noreply@yourcompany.com
NOTIFICATION_FROM_NAME=CloudForge
```

Then restart the service:
```bash
cd infrastructure/docker
docker-compose restart notification-service
```

#### How to Get Gmail App Password:
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate a new app password for "Mail"
5. Use that 16-character password in MAIL_PASSWORD

### Option 2: Disable Mail Health Check (Development)

Modify the notification service configuration to exclude mail from health checks.

Add to `services/notification-service/src/main/resources/application.yml`:

```yaml
management:
  health:
    mail:
      enabled: false
```

### Option 3: Use Mock Mail Server (Development)

Use a mock SMTP server like MailHog or FakeSMTP:

```yaml
# Add to docker-compose.yml
mailhog:
  image: mailhog/mailhog:latest
  container_name: cloudforge-mailhog
  ports:
    - "1025:1025"  # SMTP
    - "8025:8025"  # Web UI
  networks:
    - cloudforge-net

# Update notification-service environment
notification-service:
  environment:
    MAIL_HOST: mailhog
    MAIL_PORT: 1025
    MAIL_USERNAME: ""
    MAIL_PASSWORD: ""
```

Then access MailHog UI at http://localhost:8025 to see sent emails.

### Option 4: Accept as Development Limitation

For local development without email functionality, you can:
- Ignore the unhealthy status
- The service will still process events and log them
- Emails won't be sent, but the application continues working

---

## 📊 Current Configuration

From `docker-compose.yml`:

```yaml
notification-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cloudforge_notifications
    SPRING_DATASOURCE_USERNAME: cloudforge
    SPRING_DATASOURCE_PASSWORD: cloudforge123
    SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:29092
    MAIL_HOST: ${MAIL_HOST:-smtp.gmail.com}
    MAIL_PORT: ${MAIL_PORT:-587}
    MAIL_USERNAME: ${MAIL_USERNAME:-noreply@cloudforgetech.in}
    MAIL_PASSWORD: ${MAIL_PASSWORD:-}  # ← Empty, causes auth failure
```

---

## 🧪 Testing Without Email

You can still test the notification service functionality:

### 1. Check Kafka Consumer is Running

```bash
docker logs cloudforge-notification-service | grep -i kafka
```

### 2. Send a Test Event via Kafka

```bash
# Access Kafka container
docker exec -it cloudforge-kafka bash

# Create a test message
kafka-console-producer --bootstrap-server localhost:9092 --topic order-events
# Then type a JSON message and press Enter
```

### 3. Check Notification Database

```bash
# Connect to PostgreSQL
docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge_notifications

# View notifications table
SELECT * FROM notifications;
```

---

## 🎯 Recommended Action for Development

**For now, you can safely ignore the unhealthy status** if you don't need email functionality.

The notification service is:
- Running correctly
- Processing Kafka events
- Storing notifications in the database

The only issue is the health check failing due to missing email credentials, which is expected in a development environment.

---

## 🚀 Quick Fix for Production

When deploying to production:

1. **Use a proper email service**:
   - SendGrid
   - AWS SES
   - Mailgun
   - Or your company's SMTP server

2. **Store credentials securely**:
   - Use HashiCorp Vault
   - Azure Key Vault
   - Kubernetes Secrets
   - Never commit credentials to git

3. **Configure environment variables**:
   ```bash
   MAIL_HOST=smtp.sendgrid.net
   MAIL_PORT=587
   MAIL_USERNAME=apikey
   MAIL_PASSWORD=<your-sendgrid-api-key>
   ```

---

## 📝 Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Container Running | ✅ | Service is up |
| Kafka Connection | ✅ | Can consume events |
| Database Connection | ✅ | PostgreSQL working |
| Eureka Registration | ✅ | Service discovery OK |
| Email Functionality | ❌ | No valid SMTP credentials |
| Health Check | ❌ | Returns 503 due to mail check |
| **Overall Impact** | ⚠️ | **Service works, but can't send emails** |

---

## 🔗 Related Documentation

- [Docker Compose Configuration](infrastructure/docker/docker-compose.yml)
- [Notification Service Guide](docs/services/notification-service-guide.md)
- [Environment Variables](infrastructure/docker/README.md#environment-variables)

---

**Conclusion**: The notification service is functioning correctly for development purposes. The unhealthy status is expected without valid email credentials and does not affect the core functionality of the CloudForge application.
