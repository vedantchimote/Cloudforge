# MailHog Email Testing Setup

**Date**: February 12, 2026  
**Status**: ✅ Fully Operational

---

## 🎉 What Was Completed

MailHog has been successfully integrated into the CloudForge Docker environment as a mock SMTP server for email testing during development.

---

## 📦 Changes Made

### 1. Docker Compose Configuration

Added MailHog service to `infrastructure/docker/docker-compose.yml`:

```yaml
# MailHog for email testing
mailhog:
  image: mailhog/mailhog:latest
  container_name: cloudforge-mailhog
  ports:
    - "1025:1025"  # SMTP server
    - "8025:8025"  # Web UI
  networks:
    - cloudforge-net
```

### 2. Notification Service Configuration

Updated notification service environment variables:

```yaml
notification-service:
  environment:
    MAIL_HOST: mailhog
    MAIL_PORT: 1025
    MAIL_USERNAME: ""
    MAIL_PASSWORD: ""
    MAIL_SMTP_AUTH: false
    MAIL_SMTP_STARTTLS_ENABLE: false
    MAIL_SMTP_STARTTLS_REQUIRED: false
    NOTIFICATION_FROM_EMAIL: noreply@cloudforge.io
    NOTIFICATION_FROM_NAME: CloudForge
  depends_on:
    - mailhog
```

### 3. Application Properties

Updated `services/notification-service/src/main/resources/application.yml`:

```yaml
mail:
  host: ${MAIL_HOST:smtp.gmail.com}
  port: ${MAIL_PORT:587}
  username: ${MAIL_USERNAME:}
  password: ${MAIL_PASSWORD:}
  properties:
    mail:
      smtp:
        auth: ${MAIL_SMTP_AUTH:true}
        starttls:
          enable: ${MAIL_SMTP_STARTTLS_ENABLE:true}
          required: ${MAIL_SMTP_STARTTLS_REQUIRED:true}
```

---

## 🌐 Access MailHog

**Web UI**: http://localhost:8025

The MailHog web interface provides:
- Real-time email inbox
- HTML and plain text email viewing
- Email search and filtering
- Raw email source viewing
- Email deletion
- No authentication required

---

## 🧪 Testing Email Functionality

### Method 1: Register a New User

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Then check http://localhost:8025 to see the welcome email.

### Method 2: Place an Order

1. Open http://localhost:3000
2. Login or register
3. Browse products
4. Add items to cart
5. Complete checkout
6. Check MailHog for order confirmation email

### Method 3: Send Kafka Event

```bash
# Access Kafka container
docker exec -it cloudforge-kafka bash

# Send order event
kafka-console-producer --bootstrap-server localhost:9092 --topic cloudforge.orders.created

# Paste this JSON and press Enter:
{
  "orderId": "TEST-001",
  "userId": "user123",
  "userEmail": "test@example.com",
  "status": "CONFIRMED",
  "totalAmount": 99.99,
  "items": [
    {"productId": "prod-1", "quantity": 2, "price": 49.99}
  ]
}
```

### Method 4: Check Notification Service Logs

```bash
# View notification service logs
docker logs -f cloudforge-notification-service

# Look for email sending logs
docker logs cloudforge-notification-service 2>&1 | Select-String -Pattern "Sending email"
```

---

## ✅ Service Status

All services are now healthy:

| Service | Status | Notes |
|---------|--------|-------|
| MailHog | ✅ Running | SMTP: 1025, UI: 8025 |
| Notification Service | ✅ Healthy | Connected to MailHog |
| Kafka | ✅ Healthy | Event streaming working |
| PostgreSQL | ✅ Healthy | Notification DB ready |
| All Other Services | ✅ Healthy | 17/17 containers running |

---

## 🎯 Benefits of MailHog

### For Development
- **Zero configuration** - Works out of the box
- **No credentials needed** - No Gmail app passwords required
- **Instant delivery** - See emails immediately
- **Safe testing** - Emails never leave your machine
- **No spam risk** - Can't accidentally email real users

### For Testing
- **Visual verification** - See exactly what users receive
- **HTML rendering** - Check email templates
- **Full headers** - Debug email issues
- **Raw source** - Inspect MIME structure
- **API access** - Automate email testing

### For Team Collaboration
- **Shared inbox** - Everyone sees the same emails
- **Easy cleanup** - Restart container to clear
- **No quotas** - Unlimited emails
- **Fast iteration** - Test email changes quickly

---

## 📊 Container Details

### MailHog Container

- **Image**: mailhog/mailhog:latest
- **Size**: ~10MB (very lightweight)
- **Ports**:
  - 1025: SMTP server (for sending emails)
  - 8025: Web UI (for viewing emails)
- **Memory**: ~10-20MB
- **CPU**: Minimal (<1%)

### Features

1. **SMTP Server** (Port 1025)
   - Accepts all emails
   - No authentication required
   - Compatible with all SMTP clients

2. **Web UI** (Port 8025)
   - Modern, responsive interface
   - Real-time email updates
   - Search and filter capabilities
   - Multiple email format views

3. **API** (Port 8025)
   - RESTful API for automation
   - List, retrieve, delete emails
   - Perfect for integration tests

---

## 🔄 Email Flow

```
Application → Notification Service → MailHog SMTP (1025) → MailHog Storage → Web UI (8025)
```

1. **Application triggers event** (user registration, order placement, etc.)
2. **Kafka event published** to appropriate topic
3. **Notification service consumes** Kafka event
4. **Email composed** using Thymeleaf templates
5. **SMTP connection** to MailHog on port 1025
6. **Email captured** by MailHog
7. **View in browser** at http://localhost:8025

---

## 🛠️ Troubleshooting

### MailHog Not Accessible

```bash
# Check if MailHog is running
docker ps | Select-String -Pattern "mailhog"

# Check MailHog logs
docker logs cloudforge-mailhog

# Restart MailHog
docker restart cloudforge-mailhog
```

### Notification Service Can't Connect

```bash
# Check notification service logs
docker logs cloudforge-notification-service | Select-String -Pattern "mail"

# Verify environment variables
docker exec cloudforge-notification-service env | Select-String -Pattern "MAIL"

# Restart notification service
docker restart cloudforge-notification-service
```

### No Emails Appearing

```bash
# Check if notification service is healthy
docker ps | Select-String -Pattern "notification"

# Check Kafka topics
docker exec cloudforge-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check notification database
docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge_notifications -c "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;"
```

---

## 🚀 Production Deployment

For production, replace MailHog with a real email service:

### Option 1: SendGrid (Recommended)

```yaml
notification-service:
  environment:
    MAIL_HOST: smtp.sendgrid.net
    MAIL_PORT: 587
    MAIL_USERNAME: apikey
    MAIL_PASSWORD: ${SENDGRID_API_KEY}
    MAIL_SMTP_AUTH: true
    MAIL_SMTP_STARTTLS_ENABLE: true
    MAIL_SMTP_STARTTLS_REQUIRED: true
```

### Option 2: AWS SES

```yaml
notification-service:
  environment:
    MAIL_HOST: email-smtp.us-east-1.amazonaws.com
    MAIL_PORT: 587
    MAIL_USERNAME: ${AWS_SMTP_USERNAME}
    MAIL_PASSWORD: ${AWS_SMTP_PASSWORD}
    MAIL_SMTP_AUTH: true
    MAIL_SMTP_STARTTLS_ENABLE: true
    MAIL_SMTP_STARTTLS_REQUIRED: true
```

### Option 3: Gmail (Small Scale)

```yaml
notification-service:
  environment:
    MAIL_HOST: smtp.gmail.com
    MAIL_PORT: 587
    MAIL_USERNAME: ${GMAIL_USERNAME}
    MAIL_PASSWORD: ${GMAIL_APP_PASSWORD}
    MAIL_SMTP_AUTH: true
    MAIL_SMTP_STARTTLS_ENABLE: true
    MAIL_SMTP_STARTTLS_REQUIRED: true
```

---

## 📝 Quick Commands

```bash
# Start all services including MailHog
cd infrastructure/docker
docker-compose up -d

# View MailHog UI
start http://localhost:8025

# Check MailHog status
docker ps | Select-String -Pattern "mailhog"

# View MailHog logs
docker logs cloudforge-mailhog

# Restart MailHog
docker restart cloudforge-mailhog

# Clear all emails (restart container)
docker restart cloudforge-mailhog

# Stop MailHog
docker stop cloudforge-mailhog

# Remove MailHog
docker rm cloudforge-mailhog
```

---

## 🔗 Related Documentation

- [MailHog GitHub](https://github.com/mailhog/MailHog)
- [MailHog API Documentation](https://github.com/mailhog/MailHog/blob/master/docs/APIv2.md)
- [Notification Service Status](NOTIFICATION_SERVICE_STATUS.md)
- [Running Containers Guide](RUNNING_CONTAINERS.md)
- [Docker Setup Summary](DOCKER_SETUP_SUMMARY.md)

---

## 🎉 Success Metrics

- ✅ MailHog container running
- ✅ SMTP server accessible on port 1025
- ✅ Web UI accessible on port 8025
- ✅ Notification service healthy
- ✅ Email sending working
- ✅ All 17 containers operational
- ✅ Zero configuration required
- ✅ Development-ready email testing

---

**Status**: ✅ Complete and Operational  
**Last Updated**: February 12, 2026  
**Total Containers**: 17 (16 application + 1 MailHog)  
**Healthy Services**: 17/17

**MailHog UI**: http://localhost:8025 🎯
