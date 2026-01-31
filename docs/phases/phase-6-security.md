# Phase 6: Security Hardening

**Duration:** Week 8  
**Goal:** Implement security best practices with Vault, scanning, and policies

---

## 📋 Objectives

| Objective | Status | Priority |
|-----------|--------|----------|
| Deploy HashiCorp Vault | ⬜ | P0 |
| Store secrets in Vault | ⬜ | P0 |
| Configure dynamic secrets | ⬜ | P1 |
| Add Trivy to CI | ⬜ | P0 |
| Configure OWASP ZAP | ⬜ | P1 |
| Implement RBAC policies | ⬜ | P1 |
| Network policies | ⬜ | P2 |

---

## 🏗️ Security Architecture

```mermaid
graph TB
    subgraph "CI Pipeline"
        TR[Trivy Scanner]
        ZAP[OWASP ZAP]
        SQ[SonarQube]
    end
    
    subgraph "Kubernetes"
        subgraph "Security"
            VT[HashiCorp Vault]
            CSI[Secrets Store CSI]
        end
        
        subgraph "Network"
            NP[Network Policies]
            ING[Ingress Controller]
        end
        
        subgraph "Applications"
            US[User Service]
            PS[Product Service]
        end
    end
    
    subgraph "External"
        LDAP[(OpenLDAP)]
        DB[(PostgreSQL)]
    end
    
    TR -->|scan images| US & PS
    ZAP -->|DAST scan| ING
    VT -->|inject secrets| US & PS
    US & PS -->|authenticated| DB
    NP -->|restrict| US & PS
```

---

## 🔐 HashiCorp Vault

### Installation
```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update

helm upgrade --install vault hashicorp/vault \
  --namespace security \
  --create-namespace \
  --values security/vault/values.yaml
```

### Vault Values
```yaml
# security/vault/values.yaml
server:
  dev:
    enabled: false
  ha:
    enabled: true
    replicas: 3
    raft:
      enabled: true
  ingress:
    enabled: true
    hosts:
      - host: vault.cloudforge.local

injector:
  enabled: true
  
ui:
  enabled: true
```

### Initialize Vault
```bash
# Initialize Vault
kubectl exec -it vault-0 -n security -- vault operator init

# Unseal Vault (use 3 of 5 keys)
kubectl exec -it vault-0 -n security -- vault operator unseal <key1>
kubectl exec -it vault-0 -n security -- vault operator unseal <key2>
kubectl exec -it vault-0 -n security -- vault operator unseal <key3>

# Login
kubectl exec -it vault-0 -n security -- vault login <root-token>
```

### Configure Secrets Engine
```bash
# Enable KV secrets engine
vault secrets enable -path=cloudforge kv-v2

# Store database credentials
vault kv put cloudforge/user-service/database \
  username=cloudforge \
  password=cloudforge123

vault kv put cloudforge/product-service/mongodb \
  username=cloudforge \
  password=cloudforge123 \
  connection_string=mongodb://cloudforge:cloudforge123@mongodb:27017/products

# Store API keys
vault kv put cloudforge/payment-service/stripe \
  api_key=${STRIPE_API_KEY} \
  webhook_secret=${STRIPE_WEBHOOK_SECRET}
```

### Configure Kubernetes Auth
```bash
# Enable Kubernetes auth
vault auth enable kubernetes

# Configure Kubernetes auth
vault write auth/kubernetes/config \
  kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" \
  token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Create policy
vault policy write user-service - <<EOF
path "cloudforge/data/user-service/*" {
  capabilities = ["read"]
}
EOF

# Create role for user-service
vault write auth/kubernetes/role/user-service \
  bound_service_account_names=user-service \
  bound_service_account_namespaces=cloudforge \
  policies=user-service \
  ttl=1h
```

### Inject Secrets into Pods
```yaml
# Add annotations to deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "user-service"
        vault.hashicorp.com/agent-inject-secret-database: "cloudforge/data/user-service/database"
        vault.hashicorp.com/agent-inject-template-database: |
          {{- with secret "cloudforge/data/user-service/database" -}}
          export DB_USERNAME="{{ .Data.data.username }}"
          export DB_PASSWORD="{{ .Data.data.password }}"
          {{- end -}}
```

---

## 🔍 Container Scanning

### Trivy in CI
```yaml
# Already in ci.yml - ensure it fails on critical
- name: Run Trivy scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.IMAGE_NAME }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'  # Fail build on vulnerabilities
```

### Trivy Operator
```bash
helm upgrade --install trivy-operator aquasecurity/trivy-operator \
  --namespace security \
  --values security/trivy/values.yaml
```

```yaml
# security/trivy/values.yaml
operator:
  scanJobsConcurrentLimit: 3
trivy:
  severity: CRITICAL,HIGH,MEDIUM
  ignoreUnfixed: true
```

---

## 🛡️ DAST Scanning with ZAP

### Scheduled Scan Workflow
```yaml
# .github/workflows/security-scan.yml (enhanced)
jobs:
  zap-full-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy test environment
        run: |
          docker-compose -f infrastructure/docker/docker-compose.yml up -d
          sleep 120  # Wait for services

      - name: OWASP ZAP Full Scan
        uses: zaproxy/action-full-scan@v0.7.0
        with:
          target: 'http://localhost:8080'
          rules_file_name: '.zap/rules.tsv'
          fail_action: true

      - name: Upload ZAP Report
        uses: actions/upload-artifact@v4
        with:
          name: zap-full-report
          path: |
            report_html.html
            report_json.json
```

---

## 🔒 Network Policies

```yaml
# security/network-policies/default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: cloudforge
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
# security/network-policies/allow-internal.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-cloudforge-internal
  namespace: cloudforge
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/part-of: cloudforge
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: cloudforge
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: cloudforge
        - namespaceSelector:
            matchLabels:
              name: data
        - namespaceSelector:
            matchLabels:
              name: security

---
# security/network-policies/user-service.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: user-service-policy
  namespace: cloudforge
spec:
  podSelector:
    matchLabels:
      app: user-service
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - port: 8081
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: data
          podSelector:
            matchLabels:
              app: postgres
      ports:
        - port: 5432
    - to:
        - namespaceSelector:
            matchLabels:
              name: data
          podSelector:
            matchLabels:
              app: openldap
      ports:
        - port: 389
```

---

## 👮 RBAC Policies

```yaml
# security/rbac/developer-role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer
  namespace: cloudforge
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods/log", "pods/exec"]
    verbs: ["get", "create"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-binding
  namespace: cloudforge
subjects:
  - kind: Group
    name: developers
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io
```

---

## ✅ Phase 6 Checklist

- [ ] Vault deployed and initialized
- [ ] Secrets stored in Vault
- [ ] Kubernetes auth configured
- [ ] Secrets injecting into pods
- [ ] Trivy integrated in CI
- [ ] Trivy Operator running
- [ ] ZAP scans scheduled
- [ ] Network policies applied
- [ ] RBAC configured
- [ ] Pod Security Standards set

---

## 🧪 Verification

```bash
# Verify Vault secrets
kubectl exec -it user-service-xxx -n cloudforge -- cat /vault/secrets/database

# Check Network Policies
kubectl get networkpolicies -n cloudforge

# View Trivy scan results
kubectl get vulnerabilityreports -n cloudforge

# Test RBAC
kubectl auth can-i get pods --as=developer@cloudforge.io -n cloudforge
```

---

**Next Phase:** [Phase 7 - Azure Deployment](phase-7-azure.md)
