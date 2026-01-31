# Frontend Index

Documentation for CloudForge React/TypeScript frontend.

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [React Development Guide](../react-development.md) | Main development guide |
| [Pages Guide](pages-guide.md) | Page implementations |
| [Components](components.md) | UI component library |

---

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Primitives (Button, Input)
│   │   ├── layout/      # Layout (Header, Footer)
│   │   └── features/    # Feature components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API layer
│   ├── store/           # Zustand stores
│   ├── context/         # React Context
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   └── schemas/         # Zod validation
├── tests/
│   ├── unit/
│   └── e2e/
└── public/
```

---

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| React 18 | UI Library |
| TypeScript | Type Safety |
| Vite | Build Tool |
| TailwindCSS | Styling |
| React Query | Server State |
| Zustand | Client State |
| React Hook Form | Form Handling |
| Zod | Validation |
| React Router | Routing |
| Vitest | Unit Testing |
| Playwright | E2E Testing |

---

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev        # Development
npm run build      # Production build
npm test           # Unit tests
npm run test:e2e   # E2E tests
```

---

## 📚 Related Docs

- [Testing Strategy](../testing-strategy.md)
- [Code Style Guide](../code-style-guide.md)
