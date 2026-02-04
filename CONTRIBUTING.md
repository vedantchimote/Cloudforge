# Contributing to CloudForge

Thank you for your interest in contributing to CloudForge! 🎉

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

---

## Code of Conduct

Please be respectful and inclusive. We welcome contributors from all backgrounds.

---

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cloudforge.git
   ```
3. **Set up** the development environment (see [Local Setup](docs/local-setup.md))
4. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

### Backend (Java/Spring Boot)
```bash
cd services/<service-name>
./mvnw spring-boot:run
./mvnw test
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
npm test
```

### Docker
```bash
docker-compose up -d
docker-compose logs -f <service-name>
```

---

## Pull Request Process

1. **Update** documentation for any new features
2. **Write/update** tests (maintain 70%+ coverage)
3. **Run** the full test suite locally
4. **Ensure** CI pipeline passes
5. **Request** review from maintainers

### Commit Message Format
```
type(scope): description

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(user-service): add password reset endpoint
fix(payment): resolve race condition in refund process
docs(readme): update quick start instructions
```

---

## Coding Standards

### Java
- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable/method names
- Write Javadoc for public methods

### TypeScript/React
- Use functional components with hooks
- Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript strict mode

### General
- Keep functions small and focused
- Write self-documenting code
- Add comments for complex logic only

---

## Questions?

Open an issue or reach out to the maintainers!
