# RestMan System Design Document

## Executive Summary

RestMan is a maintenance management platform that connects restaurants/businesses with technicians for equipment troubleshooting and repair. The system leverages AI for intelligent problem diagnosis while providing fallback mechanisms to address AI dependency concerns.

## System Overview

### Current State
- **Users**: 2,000 (Restaurant staff, managers, technicians)
- **Businesses**: 200 restaurants/commercial establishments  
- **Technicians**: 100+ certified repair professionals
- **Geographic Coverage**: Israel (current), USA & Europe (planned)
- **Tech Stack**: NestJS backend, React Native mobile, OpenAI integration

### Key Pain Points Addressed
1. **AI Dependency Risk**: Heavy reliance on AI for problem diagnosis
2. **Scalability**: Growth from Israel to global markets
3. **Reliability**: System availability for critical equipment failures
4. **Multi-tenancy**: Supporting diverse business types and regions

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile Apps   │    │   Web Portal    │    │  Admin Portal   │
│  (React Native) │    │    (React)      │    │    (React)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                             │
│              (Rate Limiting, Auth, Routing)                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Core Services  │    │  AI Services    │    │ Notification    │
│   (NestJS)      │    │   (Isolated)    │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ PostgreSQL   │ │    Redis     │ │ File Storage │           │
│  │ (Primary DB) │ │   (Cache)    │ │    (S3)      │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Service Architecture

#### 1. Core Services (NestJS)
```
core-service/
├── equipment/          # Equipment management
├── technician/         # Technician profiles & scheduling  
├── issue/             # Issue tracking & workflow
├── business/          # Business/restaurant management
├── auth/              # Authentication & authorization
├── notification/      # Multi-channel notifications
└── reporting/         # Analytics & reporting
```

#### 2. AI Services (Isolated)
```
ai-service/
├── diagnosis/         # Problem analysis & suggestions
├── knowledge-base/    # Solution repository
├── nlp/              # Text processing & enhancement
├── similarity/       # Problem matching algorithms
└── fallback/         # Non-AI backup mechanisms
```

## Database Design

### Core Entities

```sql
-- Business entities
CREATE TABLE businesses (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type business_type NOT NULL, -- restaurant, hotel, office
    region VARCHAR(50) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    subscription_tier tier_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Equipment tracking
CREATE TABLE equipment (
    id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    type equipment_type NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    location VARCHAR(255),
    purchase_date DATE,
    warranty_expiration DATE,
    maintenance_schedule JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issue management
CREATE TABLE issues (
    id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    equipment_id UUID REFERENCES equipment(id),
    reporter_id UUID REFERENCES users(id),
    assigned_technician_id UUID REFERENCES technicians(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status issue_status DEFAULT 'open',
    priority priority_level DEFAULT 'medium',
    ai_confidence_score DECIMAL(3,2),
    fallback_method fallback_type,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Technician management
CREATE TABLE technicians (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    specializations equipment_type[],
    regions VARCHAR(50)[],
    availability_hours JSONB,
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_jobs INTEGER DEFAULT 0,
    certification_level cert_level DEFAULT 'standard'
);

-- AI diagnosis tracking
CREATE TABLE ai_diagnoses (
    id UUID PRIMARY KEY,
    issue_id UUID REFERENCES issues(id),
    original_description TEXT,
    enhanced_description TEXT,
    suggested_solutions JSONB,
    confidence_score DECIMAL(3,2),
    ai_model_version VARCHAR(50),
    processing_time_ms INTEGER,
    fallback_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Partitioning Strategy
```sql
-- Partition issues by region and date for performance
CREATE TABLE issues_israel PARTITION OF issues 
FOR VALUES IN ('IL');

CREATE TABLE issues_usa PARTITION OF issues 
FOR VALUES IN ('US');

CREATE TABLE issues_europe PARTITION OF issues 
FOR VALUES IN ('EU');
```

## API Design

### RESTful API Structure

```typescript
// Core API endpoints
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
├── businesses/
│   ├── GET /businesses
│   ├── POST /businesses
│   ├── GET /businesses/:id
│   └── PUT /businesses/:id
├── equipment/
│   ├── GET /equipment
│   ├── POST /equipment
│   ├── GET /equipment/:id
│   └── PUT /equipment/:id/maintenance
├── issues/
│   ├── GET /issues
│   ├── POST /issues
│   ├── GET /issues/:id
│   ├── PUT /issues/:id/status
│   └── POST /issues/:id/assign
├── technicians/
│   ├── GET /technicians/available
│   ├── GET /technicians/:id
│   └── PUT /technicians/:id/schedule
└── ai/
    ├── POST /ai/diagnose
    ├── POST /ai/enhance-description
    ├── GET /ai/similar-issues
    └── POST /ai/generate-solution
```

### GraphQL Schema (Alternative/Additional)
```graphql
type Issue {
  id: ID!
  business: Business!
  equipment: Equipment!
  title: String!
  description: String!
  status: IssueStatus!
  assignedTechnician: Technician
  aiDiagnosis: AIDiagnosis
  createdAt: DateTime!
}

type Query {
  issues(filters: IssueFilters): [Issue!]!
  availableTechnicians(location: String!, specialization: EquipmentType): [Technician!]!
  businessEquipment(businessId: ID!): [Equipment!]!
}

type Mutation {
  createIssue(input: CreateIssueInput!): Issue!
  assignTechnician(issueId: ID!, technicianId: ID!): Issue!
  updateIssueStatus(issueId: ID!, status: IssueStatus!): Issue!
}
```

## Mobile App Architecture (React Native)

### Application Structure
```
src/
├── navigation/
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── TabNavigator.tsx
├── screens/
│   ├── auth/
│   ├── dashboard/
│   ├── issues/
│   ├── equipment/
│   └── profile/
├── components/
│   ├── common/
│   ├── forms/
│   └── modals/
├── services/
│   ├── api/
│   ├── offline/
│   └── notifications/
├── store/
│   ├── slices/
│   └── middleware/
└── utils/
    ├── validation/
    ├── formatting/
    └── constants/
```

### State Management (Redux Toolkit)
```typescript
// Store structure
interface RootState {
  auth: AuthState;
  issues: IssuesState;
  equipment: EquipmentState;
  technicians: TechniciansState;
  offline: OfflineState;
  ui: UIState;
}

// Offline-first approach
const offlineMiddleware = createListenerMiddleware();
offlineMiddleware.startListening({
  predicate: (action) => action.meta?.offline,
  effect: async (action, { dispatch }) => {
    // Queue offline actions
    await queueOfflineAction(action);
  }
});
```

### Offline Capabilities
```typescript
// Offline storage strategy
interface OfflineStorage {
  // Critical data always available
  userProfile: UserProfile;
  recentIssues: Issue[];
  equipmentList: Equipment[];
  
  // Cached AI responses
  aiDiagnoses: Record<string, AIDiagnosis>;
  
  // Pending actions
  pendingActions: OfflineAction[];
}
```

## AI/ML Integration Strategy

### Current AI Pain Points & Solutions

#### 1. AI Dependency Risk Mitigation
```typescript
interface DiagnosisStrategy {
  primary: 'ai' | 'rule-based' | 'human';
  fallbacks: Array<'rule-based' | 'similar-issues' | 'human-expert'>;
  confidence_threshold: number;
}

class DiagnosisService {
  async diagnose(issue: Issue): Promise<Diagnosis> {
    const strategies = this.getStrategies(issue);
    
    // Try AI first
    const aiResult = await this.tryAIDiagnosis(issue);
    if (aiResult.confidence > strategies.confidence_threshold) {
      return aiResult;
    }
    
    // Fallback to rule-based
    const ruleResult = await this.tryRuleBasedDiagnosis(issue);
    if (ruleResult.solutions.length > 0) {
      return ruleResult;
    }
    
    // Fallback to similar issues
    const similarResult = await this.findSimilarSolutions(issue);
    return similarResult;
  }
}
```

#### 2. AI Service Architecture
```
AI Service Cluster:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OpenAI API    │    │  Local Models   │    │ Rule Engine     │
│   (Primary)     │    │   (Backup)      │    │  (Fallback)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Diagnosis Router│
                    │  (Load Balancer)│
                    └─────────────────┘
```

#### 3. Knowledge Base Strategy
```sql
-- Non-AI knowledge base
CREATE TABLE solution_templates (
    id UUID PRIMARY KEY,
    equipment_type equipment_type NOT NULL,
    problem_pattern TEXT NOT NULL,
    solution_steps JSONB NOT NULL,
    success_rate DECIMAL(3,2),
    usage_count INTEGER DEFAULT 0,
    region VARCHAR(50),
    created_by UUID REFERENCES technicians(id)
);

-- Pattern matching for fallbacks
CREATE INDEX idx_problem_pattern ON solution_templates 
USING gin(to_tsvector('english', problem_pattern));
```

## Scalability Strategy

### Horizontal Scaling Plan

#### Phase 1: Israel (Current - 200 businesses)
```yaml
deployment:
  instances: 2
  database: 
    primary: 1 (PostgreSQL)
    replicas: 1 (read-only)
  cache: 1 (Redis)
  load_balancer: 1 (ALB)
```

#### Phase 2: Regional (200-1000 businesses)
```yaml
deployment:
  instances: 4
  database:
    primary: 1 (PostgreSQL - partitioned)
    replicas: 2 (read-only)
  cache: 2 (Redis cluster)
  regions: [israel, usa-east, europe-west]
```

#### Phase 3: Global (1000+ businesses)
```yaml
deployment:
  instances: 8+ (auto-scaling)
  database:
    sharding: by_region
    replicas: 3 per region
  cache: Redis Cluster (multi-region)
  cdn: CloudFront/CloudFlare
  monitoring: DataDog/NewRelic
```

### Performance Optimization

#### Database Optimization
```sql
-- Indexing strategy
CREATE INDEX CONCURRENTLY idx_issues_business_status 
ON issues(business_id, status) 
WHERE status IN ('open', 'in_progress');

CREATE INDEX CONCURRENTLY idx_issues_created_region 
ON issues(created_at, region) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- Query optimization
WITH recent_issues AS (
  SELECT * FROM issues 
  WHERE created_at > NOW() - INTERVAL '7 days'
    AND region = $1
)
SELECT i.*, e.type, b.name
FROM recent_issues i
JOIN equipment e ON i.equipment_id = e.id
JOIN businesses b ON i.business_id = b.id;
```

#### Caching Strategy
```typescript
interface CacheStrategy {
  // Hot data (Redis)
  user_sessions: '1 hour';
  equipment_list: '4 hours';
  technician_availability: '30 minutes';
  
  // Warm data (Application cache)
  ai_diagnoses: '24 hours';
  solution_templates: '1 week';
  business_profiles: '4 hours';
  
  // Cold data (CDN)
  static_assets: '1 month';
  documentation: '1 week';
}
```

## Geographic Distribution Strategy

### Multi-Region Architecture

```
Region: Israel (Primary)
├── Core Services: Tel Aviv DC
├── Database: Primary + 1 replica
├── AI Services: Local + OpenAI
└── CDN: Local edge locations

Region: USA (Secondary)
├── Core Services: AWS us-east-1
├── Database: Read replica + eventual consistency
├── AI Services: OpenAI primary + local fallback
└── CDN: CloudFront

Region: Europe (Tertiary)
├── Core Services: AWS eu-west-1
├── Database: Read replica + eventual consistency
├── AI Services: OpenAI + GDPR compliant alternatives
└── CDN: CloudFront + local compliance
```

### Data Residency & Compliance

```typescript
interface RegionConfig {
  israel: {
    data_residency: 'local';
    ai_providers: ['openai', 'local-models'];
    regulations: ['israeli-privacy-law'];
  };
  usa: {
    data_residency: 'local';
    ai_providers: ['openai', 'anthropic'];
    regulations: ['ccpa', 'hipaa-optional'];
  };
  europe: {
    data_residency: 'eu-only';
    ai_providers: ['openai-eu', 'local-eu-models'];
    regulations: ['gdpr', 'dpa'];
  };
}
```

## Deployment & Infrastructure

### Container Strategy (Docker + Kubernetes)

```yaml
# docker-compose.yml (development)
version: '3.8'
services:
  api:
    build: ./apps/rest-man-server
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/restman
    depends_on: [db, redis]
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: restman
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    command: redis-server --appendonly yes
```

```yaml
# kubernetes/deployment.yaml (production)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: restman-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: restman-api
  template:
    metadata:
      labels:
        app: restman-api
    spec:
      containers:
      - name: api
        image: restman/api:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/restman-api \
            api=restman/api:${{ github.sha }} \
            --namespace=staging

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/restman-api \
            api=restman/api:${{ github.sha }} \
            --namespace=production
```

## Security Architecture

### Authentication & Authorization

```typescript
// JWT + Role-based access control
interface UserClaims {
  sub: string; // user ID
  role: 'admin' | 'business_owner' | 'staff' | 'technician';
  business_id?: string;
  region: string;
  permissions: Permission[];
}

// Permission-based guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('business_owner', 'admin')
@Permissions('issues:create')
async createIssue(@Request() req, @Body() createIssueDto: CreateIssueDto) {
  // Implementation
}
```

### Data Security

```typescript
// Encryption at rest
interface EncryptionStrategy {
  pii_data: 'AES-256'; // Personal information
  business_data: 'AES-256'; // Business secrets
  ai_conversations: 'AES-256'; // Chat logs
  audit_logs: 'immutable'; // Tamper-proof
}

// Data masking for non-production
const maskSensitiveData = (data: any, environment: string) => {
  if (environment !== 'production') {
    return {
      ...data,
      email: maskEmail(data.email),
      phone: maskPhone(data.phone),
      address: 'MASKED'
    };
  }
  return data;
};
```

## Monitoring & Observability

### Metrics & Alerting

```typescript
// Key metrics to track
interface SystemMetrics {
  // Performance
  api_response_time_p95: number;
  database_query_time_p95: number;
  ai_processing_time_avg: number;
  
  // Reliability
  uptime_percentage: number;
  error_rate_percentage: number;
  ai_fallback_rate: number;
  
  // Business
  issues_created_per_hour: number;
  technician_utilization: number;
  customer_satisfaction_score: number;
}

// Alerting rules
const alerts = {
  high_error_rate: {
    condition: 'error_rate > 5%',
    action: 'page_oncall_engineer'
  },
  ai_service_down: {
    condition: 'ai_fallback_rate > 50%',
    action: 'notify_ai_team'
  },
  database_slow: {
    condition: 'db_query_time_p95 > 2s',
    action: 'scale_database_replicas'
  }
};
```

### Logging Strategy

```typescript
// Structured logging
const logger = {
  info: (message: string, context: LogContext) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...context,
      trace_id: getTraceId()
    }));
  }
};

// Usage
logger.info('Issue created', {
  user_id: req.user.id,
  business_id: issue.business_id,
  issue_id: issue.id,
  ai_confidence: diagnosis.confidence
});
```

## Migration Strategy

### Phase 1: Foundation (Months 1-2)
- [ ] Implement AI fallback mechanisms
- [ ] Add comprehensive monitoring
- [ ] Set up multi-region infrastructure
- [ ] Implement offline capabilities

### Phase 2: Scale (Months 3-4)
- [ ] Database sharding by region
- [ ] Implement GraphQL alongside REST
- [ ] Add advanced caching layers
- [ ] Performance optimization

### Phase 3: Global (Months 5-6)
- [ ] USA region deployment
- [ ] GDPR compliance for Europe
- [ ] Advanced AI model fine-tuning
- [ ] Full observability stack

## Risk Mitigation

### Technical Risks
1. **AI Service Outage**: Multi-tier fallback system
2. **Database Performance**: Read replicas + caching
3. **Region Failures**: Cross-region disaster recovery
4. **Mobile App Store Rejections**: Progressive web app fallback

### Business Risks
1. **Scaling Costs**: Auto-scaling with cost limits
2. **Data Compliance**: Region-specific deployments
3. **Technician Availability**: AI-assisted scheduling optimization
4. **Customer Churn**: Proactive issue detection

## Success Metrics

### Technical KPIs
- **Uptime**: 99.9% availability
- **Performance**: <500ms API response time (p95)
- **AI Reliability**: <10% fallback rate
- **Mobile Performance**: <2s app launch time

### Business KPIs
- **User Growth**: 2000 → 5000 users (18 months)
- **Geographic Expansion**: 3 regions operational
- **Issue Resolution**: <4 hours average time
- **Customer Satisfaction**: >4.5/5.0 rating

---

This system design provides a robust, scalable foundation for RestMan's growth from 200 businesses in Israel to a global platform serving thousands of users across multiple regions, while addressing the critical AI dependency concerns through comprehensive fallback strategies.
