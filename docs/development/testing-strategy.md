# Testing Strategy

Comprehensive testing approach for CloudForge.

---

## 🧪 Testing Pyramid

```
          ┌─────────────┐
         /   E2E Tests   \        ← Fewer, slower, expensive
        /─────────────────\
       /  Integration Tests\      ← More, faster
      /─────────────────────\
     /      Unit Tests       \    ← Many, very fast
    └─────────────────────────┘
```

| Level | Target Coverage | Tools |
|-------|-----------------|-------|
| Unit | 80%+ | JUnit 5, Mockito, Vitest |
| Integration | Key flows | Testcontainers, Playwright |
| E2E | Critical paths | Playwright |

---

## ☕ Backend Testing (Java)

### Unit Tests
```java
@Test
void shouldCreateUser() {
    // Given
    UserRequest request = new UserRequest("test@example.com", "password");
    when(userRepository.save(any())).thenReturn(new User());
    
    // When
    UserResponse response = userService.createUser(request);
    
    // Then
    assertThat(response).isNotNull();
    verify(userRepository).save(any());
}
```

### Integration Tests (Testcontainers)
```java
@Testcontainers
@SpringBootTest
class UserRepositoryIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Test
    void shouldPersistUser() {
        User user = userRepository.save(new User("test@example.com"));
        assertThat(user.getId()).isNotNull();
    }
}
```

### Running Tests
```bash
# Unit tests only
./mvnw test

# Integration tests
./mvnw verify -Pintegration

# With coverage
./mvnw verify -Pcoverage
```

---

## ⚛️ Frontend Testing (React)

### Unit Tests (Vitest)
```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

test('renders product name', () => {
  render(<ProductCard product={{ name: 'Test Product', price: 99.99 }} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
});
```

### E2E Tests (Playwright)
```typescript
test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Running Tests
```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Visual regression
npm run test:visual
```

---

## 🔗 API Testing

### Contract Testing
```yaml
# pact/user-service.json
{
  "consumer": "frontend",
  "provider": "user-service",
  "interactions": [
    {
      "description": "get user by id",
      "request": {
        "method": "GET",
        "path": "/api/users/123"
      },
      "response": {
        "status": 200,
        "body": {
          "id": "123",
          "email": "user@example.com"
        }
      }
    }
  ]
}
```

---

## 📊 Coverage Requirements

| Type | Minimum | Target |
|------|---------|--------|
| Unit (Backend) | 70% | 80% |
| Unit (Frontend) | 60% | 70% |
| Integration | Key flows | All APIs |
| E2E | Critical paths | Happy paths |

---

## 🔄 CI Integration

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - name: Run Unit Tests
        run: ./mvnw test
        
      - name: Run Integration Tests
        run: ./mvnw verify -Pintegration
        
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

---

## 📚 Related Docs

- [CI/CD Pipeline](ci-cd-pipeline.md)
- [Code Style Guide](code-style-guide.md)
