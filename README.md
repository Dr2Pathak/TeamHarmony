# TeamHarmony

**TeamHarmony** is an AI-powered team formation and evaluation platform that assesses individual personality stability, evaluates team compatibility through a structured mixture-of-agents system, and provides optimized student group assignments using deterministic graph-based clustering. It combines multi-source personality profiling (resume, audio, survey), LLM-powered multi-agent evaluation, and algorithmic optimization to deliver structured, explainable outputs — stability scores, recommendations, strengths, weaknesses, and optimized groupings.

---

## Features

- **Multi-Source Personality Profiling** — Users build a canonical profile from three data sources: resume text (PDF/TXT extraction), audio self-description (ElevenLabs speech-to-text transcription), and an 8-question structured behavioral survey covering group role, decision-making, deadline behavior, conflict handling, organization, communication comfort, skills, and frustrations.
- **Personality Stability Analyzer** — Each personality agent (Trait Consistency + MBTI Estimation) runs 3 times on identical input; stability is measured through score variance, MBTI agreement voting, and confidence aggregation to produce a 0–100 stability score with High/Medium/Low confidence levels.
- **Mixture-of-Agents Team Evaluation** — Five specialized AI agents (Role Balance, Skill Overlap, Communication Risk, Deadline Stress, MBTI Compatibility) evaluate team dynamics in parallel, then a Meta-Agent synthesizes results using weighted aggregation into a final team score, classification (Stable / Medium / Needs Change), and per-member recommendations.
- **Teacher Group Optimization** — A deterministic, zero-AI-cost algorithm that takes a list of student emails and a target group size, builds a pairwise compatibility matrix, runs greedy graph clustering, and refines via local swap optimization — completing in <200ms for 30 students and <1s for 100 students.
- **Signup / Signin** — Supabase Auth with server-side credential verification via direct REST API calls.
- **Real-Time Visualizations** — Horizontal bar charts (Recharts) displaying individual stability scores and agent evaluation breakdowns with color-coded scoring and visible labels.
- **Structured Explainable Output** — Every evaluation produces not just a score, but actionable recommendations, enumerated strengths and weaknesses, and per-member insights — all stored in structured JSON fields for auditability.

---

## Tech Stack

- **Frontend:** Next.js **16.1.6** (App Router, Turbopack) with React **19.2.4** & TypeScript **5.7.3**
- **UI Framework:** shadcn/ui (Radix UI primitives) + Tailwind CSS **4.2.0** + Lucide React icons
- **Charts:** Recharts **2.15.0** (horizontal bar charts for stability and agent scores)
- **Forms:** React Hook Form **7.54.1** + Zod **3.24.1** validation schemas
- **Backend:** Next.js API Routes (16 endpoints) — all AI orchestration and auth handled server-side
- **Database:** Supabase (PostgreSQL with Row-Level Security, JSONB structured fields, auto `updated_at` triggers)
- **File Storage:** Supabase Storage (`uploads` bucket with user-scoped folders)
- **AI Generation:** Google Gemini — `gemini-2.5-flash` (structured JSON output, `temperature: 0.7`, `thinkingBudget: 0` for latency optimization)
- **Speech-to-Text:** ElevenLabs — `scribe_v1` model (audio transcription of user self-descriptions)
- **PDF Extraction:** pdf-parse **2.4.5** (server-side resume text extraction)
- **Analytics:** Vercel Analytics **1.6.1**

---

## How It Works (end-to-end)

### Standard User Flow
1. **Register/Login** — User creates an account; credentials verified server-side via Supabase Auth REST API.
2. **Profile Creation** — User uploads a resume (PDF/TXT), records an audio self-description (transcribed by ElevenLabs `scribe_v1`), and completes an 8-question behavioral survey.
3. **Canonical Profile Generation** — Gemini (`gemini-2.5-flash`) merges all three data sources into a unified JSON profile containing `resumeSummary`, `audioTranscriptSummary`, `surveyResponses`, and a `combinedNarrative`.
4. **Personality Stability Analysis** — Two AI agents each run 3 times on the canonical profile (6 parallel Gemini calls). Score variance, MBTI majority voting, and confidence averaging produce a 0–100 stability score. An aggregation prompt produces the final recommendation, strengths, and weaknesses.
5. **Team Formation** — User creates a team, searches for members by email, and adds them.
6. **Team Evaluation** — On "Confirm & Evaluate", five specialized agents run in parallel (5 Gemini calls), then the Meta-Agent synthesizes a final assessment (1 Gemini call). Results include team score, classification, per-agent breakdowns, and per-member recommendations.
7. **Review** — User sees overall team stability score (40–100 range), classification badge, strengths/weaknesses, horizontal bar chart of agent scores, and individual member insights.

### Teacher Flow
1. **Input** — Teacher enters comma-separated student emails and a target group size.
2. **Data Fetch** — System retrieves each student's stored `estimated_mbti`, `personality_stability_score`, and `survey_data.skills` from the database.
3. **Pairwise Matrix** — O(n²) compatibility matrix computed from MBTI complementarity, communication risk, stability proximity, and skill diversity.
4. **Greedy Clustering** — O(n³): Highest-compatibility pair seeds each group; greedily expand by adding the student maximizing average compatibility.
5. **Swap Refinement** — O(n² × k): Iteratively swap students between groups if total score improves; converges when no improvement found.
6. **Output** — Optimized groups with per-group scores, member details (MBTI, stability), and overall compatibility score.

---

## System Architecture

The system has three primary components operating at different levels:

### 1. Personality Stability Analyzer (Individual-Level AI)

Validates that a user's personality data is internally consistent and reliable before it's used in team evaluation.

**Agent Architecture:**

| Agent | Purpose | Output |
|-------|---------|--------|
| **Trait Consistency Agent** | Evaluates internal coherence of personality traits, skill-experience alignment, cross-source consistency, behavioral pattern matching, and contradiction detection | `{ score: 0–1, strengths[], weaknesses[], explanation }` |
| **MBTI Estimation Agent** | Infers MBTI personality type from work style patterns, verbal cues, and survey responses with confidence scoring | `{ estimated_mbti: "XXXX", confidence: 0–1, strengths[], weaknesses[], explanation }` |

**Stability Mechanism:**
Each agent runs **3 times** on identical input. Consistency is measured through:

```
Stability Score (0–100) =
  35% × average trait consistency score +
  25% × trait score consistency (1 - variance×4) +
  25% × MBTI agreement (majority vote / 3) +
  15% × average MBTI confidence
```

**Confidence Classification:**
- **High**: score ≥ 75
- **Medium**: score 50–74
- **Low**: score < 50

---

### 2. Team Compatibility Evaluation (Mixture-of-Agents AI)

Triggered when a user clicks "Confirm & Evaluate Team". Five specialized agents run **in parallel**, followed by a Meta-Agent that synthesizes results.

**Agent Specializations:**

| Agent | Weight | Evaluation Focus |
|-------|--------|-----------------|
| **Role Balance** | 25% | Role diversity (technical, creative, management, analytical), critical function coverage, redundancy, gap analysis |
| **Skill Overlap** | 20% | Skill complementarity vs redundancy, coverage breadth, expertise depth, synergy potential |
| **Communication Risk** | 20% | Communication style compatibility (direct/indirect, formal/casual), conflict potential, feedback dynamics, information flow barriers |
| **Deadline Stress** | 20% | Individual stress resilience, time management, crisis response capability, procrastination risk, support dynamics under pressure |
| **MBTI Compatibility** | 15% | Type distribution diversity, decision-making balance (T/F), information processing (S/N), energy dynamics (E/I), structure/flexibility (J/P), known conflict pairings |

Each agent outputs: `{ score: 0–1, recommendation, strengths[], weaknesses[], explanation }`

**Meta-Agent Aggregation:**
```
team_score =
  0.25 × role_balance +
  0.20 × skill_overlap +
  0.20 × communication_risk +
  0.20 × deadline_stress +
  0.15 × mbti_compatibility
```

**Classification Logic:**
- **Stable**: `weightedScore ≥ 0.65` AND no agent score < 0.3
- **Medium**: `weightedScore 0.55–0.65` AND no agent score < 0.3
- **Needs Change**: `weightedScore < 0.55` OR any agent score < 0.3

**Score Display Range:** The raw 0–1 score is mapped to **40–100** (`40 + weightedScore × 60`) where 40 = lowest viable team and 100 = ideal match.

---

### 3. Teacher Group Optimizer (Deterministic Graph Algorithm)

A zero-AI-cost optimization system that forms optimal student groups using only stored structured data.

**Pairwise Compatibility Formula:**
```
compatibility(i, j) =
  0.30 × mbti_complementarity +
  0.25 × communication_score +
  0.25 × stability_proximity +
  0.20 × skill_diversity
```

**MBTI Complementarity Scoring (weight: 0.30):**

| Condition | Score |
|-----------|-------|
| Perfect complement (e.g., INTJ ↔ ENFP) | 0.9 |
| 3 of 4 letters match | 0.75 |
| Same type | 0.6 |
| Other / unavailable | 0.5 |

Static complement pairs: `INTJ↔ENFP`, `INTP↔ENTJ`, `INFJ↔ENTP`, `INFP↔ENFJ`, `ISTJ↔ESFP`, `ISFJ↔ESTP`, `ISTP↔ESFJ`, `ISFP↔ESTJ`

**Communication Score (weight: 0.25):**
- Both high stability (≥65): 0.8
- Both low stability: 0.6
- Mixed: 0.5

**Stability Proximity (weight: 0.25):**
`1 - |stability_i/100 - stability_j/100|` clamped to [0, 1]

**Skill Diversity via Jaccard Similarity (weight: 0.20):**
- Overlap > 60%: 0.5 (too similar, penalized)
- Overlap 30–60%: 0.7 (moderate, rewarded)
- Overlap < 30%: 0.9 (diverse, strongly rewarded)

**Algorithm Pipeline:**

1. **Build Pairwise Matrix** — O(n²) symmetric compatibility matrix
2. **Greedy Graph Clustering** — O(n³): Find highest-compatibility pair → start group → greedily add students maximizing average compatibility → lock group → repeat
3. **Local Swap Refinement** — O(n² × k): For all cross-group student pairs, swap if total score improves; repeat until convergence (max 100 iterations)

**Performance:** <200ms for 30 students, <1s for 100 students.

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/register` | POST | Create user (Supabase Auth + DB row) |
| `/api/auth/login` | POST | Server-side credential verification via Supabase REST API |
| `/api/auth/logout` | POST | Server-side session cleanup |
| `/api/profile/update` | POST | Upload resume/audio, transcribe, update survey data |
| `/api/profile/analyze` | POST | Build canonical profile + run personality stability pipeline (7 Gemini calls) |
| `/api/audio/transcribe` | POST | Standalone ElevenLabs speech-to-text |
| `/api/users/search` | GET | Search users by email for team member selection |
| `/api/teams` | GET | List user's teams with members and agent scores |
| `/api/teams` | POST | Create new team |
| `/api/teams/[id]` | GET | Get team detail with evaluation results |
| `/api/teams/[id]` | DELETE | Delete team |
| `/api/teams/[id]/members` | POST | Add member to team |
| `/api/teams/[id]/members/[memberId]` | DELETE | Remove member from team |
| `/api/teams/[id]/confirm` | POST | Confirm team + run full evaluation pipeline (6 Gemini calls) |
| `/api/teacher/optimize-groups` | POST | Deterministic group optimization (zero AI calls) |

---

## Database Schema

**Users** — `id`, `auth_id`, `name`, `email`, `role`, `resume_text`, `survey_data` (JSONB), `audio_transcript`, `canonical_profile` (JSONB), `personality_stability_score`, `personality_confidence_level`, `estimated_mbti`, `personality_recommendation`, `personality_strengths` (JSONB), `personality_weaknesses` (JSONB), `profile_complete`, `created_at`, `updated_at`

**Teams** — `id`, `owner_user_id` (FK→users), `name`, `description`, `confirmed`, `team_stability_score`, `team_classification`, `team_recommendation`, `team_strengths` (JSONB), `team_weaknesses` (JSONB), `created_at`, `updated_at`

**Team Members** — `id`, `team_id` (FK→teams), `user_id` (FK→users), `member_recommendation`, `member_strengths` (JSONB), `member_weaknesses` (JSONB), `UNIQUE(team_id, user_id)`

**Agent Scores** — `id`, `team_id` (FK→teams), `agent_name`, `score`, `strengths` (JSONB), `weaknesses` (JSONB), `explanation`, `recommendation`

All tables have Row-Level Security policies, indexed foreign keys, and automatic `updated_at` triggers.

---

## Optimizations

- **Parallel Agent Execution** — All personality agents (6 calls) and all team agents (5 calls) run via `Promise.all()` instead of sequentially, reducing latency from ~30s to ~5s.
- **Gemini Thinking Budget Disabled** — `thinkingConfig: { thinkingBudget: 0 }` eliminates Gemini's internal reasoning overhead, providing ~3× faster JSON generation.
- **Server-Side Auth** — Login bypasses the browser Supabase client entirely (which caused hanging issues) by authenticating via direct REST API calls to Supabase Auth from the server, returning user data directly.
- **Zero-AI Teacher Optimization** — The group optimizer uses pure in-memory computation with no LLM calls, making it effectively free to run and deterministically reproducible.
- **Embedding-Free Stability** — The personality stability pipeline uses score variance and majority voting instead of vector embeddings, eliminating the dependency on embedding models.
- **Local Swap Refinement** — Post-greedy optimization through pairwise swaps improves group quality beyond the initial greedy solution without increasing asymptotic complexity.

---

## Code Organization

```
lib/
├── agents/
│   ├── trait-consistency.ts              # Trait coherence evaluator
│   ├── mbti-estimation.ts               # MBTI type inference
│   ├── personality-stability-pipeline.ts # 6-call parallel pipeline + aggregation
│   ├── role-balance.ts                  # Team role diversity agent
│   ├── skill-overlap.ts                 # Skill complementarity agent
│   ├── communication-risk.ts            # Communication conflict agent
│   ├── deadline-stress.ts               # Stress resilience agent
│   ├── mbti-compatibility.ts            # MBTI synergy agent
│   ├── meta-agent.ts                    # Weighted synthesis + classification
│   └── team-evaluation-pipeline.ts      # 5-agent parallel pipeline
├── teacher/
│   ├── scoringUtils.ts                  # Pairwise compatibility formulas
│   ├── buildPairwiseMatrix.ts           # O(n²) symmetric matrix
│   ├── greedyCluster.ts                 # O(n³) greedy group construction
│   └── refineSwaps.ts                   # Local swap optimization
├── supabase/
│   ├── client.ts                        # Browser Supabase client (singleton + reset)
│   └── server.ts                        # Server-side service role client
├── gemini.ts                            # Gemini model init + generateJSON helper
├── elevenlabs.ts                        # ElevenLabs speech-to-text
├── types.ts                             # All TypeScript types + DB-to-client mappers
└── validation-schemas.ts               # Zod form validation schemas

app/
├── (auth)/login/                        # Login page
├── (auth)/register/                     # Registration page
├── (app)/dashboard/                     # Dashboard with team metrics
├── (app)/profile/                       # Profile + personality analysis
├── (app)/teams/                         # Team list
├── (app)/teams/[id]/                    # Team detail + evaluation
├── (app)/teams/create/                  # Team creation
├── (app)/teacher/                       # Teacher group optimization
├── (app)/about/                         # About page
└── api/                                 # 16 API routes (see table above)
```

---

## Use Cases

- **Students** — Build personality profiles, discover MBTI estimates, understand personal stability scores, and get placed into compatible project teams.
- **Team Leaders** — Create teams, evaluate compatibility before committing to a roster, and get actionable per-member recommendations for improving team dynamics.
- **Educators / Teachers** — Input a class roster of emails and a target group size to automatically generate optimized student groups based on personality compatibility — no AI cost, instant results.
- **Organizations** — Assess team stability at scale with structured, explainable metrics rather than subjective gut-feel team formation.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (with Auth, Database, Storage enabled)
- Google Gemini API key
- ElevenLabs API key

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Setup
```bash
# Install dependencies
pnpm install

# Run database migrations in Supabase Dashboard SQL Editor
# (see supabase/migrations/001_initial_schema.sql and 002_add_estimated_mbti.sql)

# Start development server
pnpm dev
```

---

## Strengths

- Multi-layer validation (individual stability + team compatibility)
- Stability-aware AI architecture with 3× repeated evaluation for consistency
- Deterministic teacher optimization with zero AI cost
- Structured, explainable outputs (not black-box scores)
- Modular agent architecture — agents are independently testable and replaceable
- Parallel execution minimizes latency
- Scalable to 100+ students for group optimization

## Limitations

- MBTI inference quality depends on Gemini model consistency
- Greedy clustering is locally optimal, not globally optimal (mitigated by swap refinement)
- Personality scoring may be sensitive to prompt variations across model updates
- Teacher optimizer does not account for non-personality constraints (e.g., demographics, scheduling)

## Future Enhancements

- Fairness constraints in teacher grouping (demographic diversity enforcement)
- Spectral clustering as an alternative to greedy graph clustering
- Advanced meta-learning weighting based on historical team outcomes
- Longitudinal team performance tracking
- Real-time team updates via Supabase subscriptions
