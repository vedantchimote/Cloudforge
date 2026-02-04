---
title: "Code Style Guide"
description: "Coding standards and conventions for Java and TypeScript"
icon: "code"
---

# Code Style Guide

Coding standards and conventions for CloudForge.

---

## ☕ Java / Spring Boot

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `UserService`, `OrderController` |
| Methods | camelCase | `findUserById`, `processPayment` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Packages | lowercase | `com.cloudforge.user` |

### Project Structure
```
src/main/java/com/cloudforge/<service>/
├── controller/     # REST controllers
├── service/        # Business logic
├── repository/     # Data access
├── model/          # Domain entities
├── dto/            # Request/Response DTOs
├── config/         # Configuration classes
├── exception/      # Custom exceptions
└── util/           # Utilities
```

### Code Examples
```java
// ✅ Good - Clear, documented
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }
}

// ❌ Bad - No structure
@RestController
public class UserController {
    @Autowired UserService svc;
    @GetMapping("/api/users/{id}")
    public UserResponse get(@PathVariable String id) {
        return svc.find(UUID.fromString(id));
    }
}
```

---

## ⚛️ TypeScript / React

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase, use prefix | `useAuth`, `useProducts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Constants | SCREAMING_SNAKE | `API_BASE_URL` |

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom hooks
├── services/       # API calls
├── types/          # TypeScript types
├── utils/          # Utilities
└── context/        # React context
```

### Code Examples
```typescript
// ✅ Good - Typed, clean
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
};

// ❌ Bad - No types, unclear
export function ProductCard(props: any) {
  return <div onClick={() => props.add(props.p.id)}>{props.p.name}</div>;
}
```

---

## 📝 General Guidelines

### Comments
```java
// ✅ Good - Explains WHY
// Using optimistic locking to prevent race conditions during payment
@Version
private Long version;

// ❌ Bad - States the obvious
// This is the user id
private UUID userId;
```

### Error Handling
```java
// ✅ Good - Specific exception
throw new UserNotFoundException("User not found: " + id);

// ❌ Bad - Generic
throw new RuntimeException("Error");
```

---

## 🔧 Tooling

| Tool | Purpose | Config |
|------|---------|--------|
| Checkstyle | Java style | `checkstyle.xml` |
| ESLint | TypeScript lint | `.eslintrc.json` |
| Prettier | Code formatting | `.prettierrc` |
| EditorConfig | Editor settings | `.editorconfig` |

---

## 📚 Related Docs

- [Testing Strategy](testing-strategy.md)
- [API Reference](api-reference.md)
