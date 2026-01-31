# Frontend Components Library

Comprehensive UI component documentation for CloudForge.

---

## 📋 Component Categories

| Category | Components |
|----------|------------|
| **UI Primitives** | Button, Input, Select, Checkbox, Radio |
| **Layout** | Container, Grid, Stack, Divider |
| **Navigation** | Navbar, Sidebar, Breadcrumb, Tabs |
| **Feedback** | Alert, Toast, Spinner, Skeleton |
| **Overlay** | Modal, Drawer, Dropdown, Tooltip |
| **Data Display** | Card, Table, Badge, Avatar |

---

## 🔘 Button Component

```tsx
// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border-2 border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
```

---

## 📝 Input Component

```tsx
// src/components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`block w-full rounded-lg border px-4 py-2.5
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
);
```

---

## 📦 Card Component

```tsx
// src/components/ui/Card.tsx
export const Card = ({ children, className }) => (
  <div className={`rounded-xl border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="p-6 pb-0">{children}</div>
);

export const CardContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

export const CardFooter = ({ children }) => (
  <div className="flex items-center p-6 pt-0">{children}</div>
);
```

---

## 🔔 Alert Component

```tsx
// src/components/ui/Alert.tsx
const variants = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

export const Alert = ({ variant = 'info', children }) => (
  <div className={`rounded-lg border p-4 ${variants[variant]}`} role="alert">
    {children}
  </div>
);
```

---

## ⏳ Spinner Component

```tsx
// src/components/ui/Spinner.tsx
const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export const Spinner = ({ size = 'md' }) => (
  <div
    className={`animate-spin rounded-full border-2 border-indigo-600 
      border-t-transparent ${sizes[size]}`}
    role="status"
  >
    <span className="sr-only">Loading...</span>
  </div>
);
```

---

## 🏷️ Badge Component

```tsx
// src/components/ui/Badge.tsx
const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-indigo-100 text-indigo-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

export const Badge = ({ variant = 'default', children }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
    {children}
  </span>
);
```

---

## 📚 Related Docs

- [React Development Guide](react-development.md)
- [Pages Guide](pages-guide.md)
