# Graph Report - expense-management  (2026-09-23)

## Corpus Check
- Corpus is ~37,054 words - fits in a single context window. You may not need a graph.

## Summary
- 446 nodes · 1157 edges · 25 communities (15 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20

## God Nodes (most connected - your core abstractions)
1. `react-native` - 64 edges
2. `colors` - 58 edges
3. `react` - 36 edges
4. `apiClient()` - 28 edges
5. `get_db()` - 27 edges
6. `@expo/vector-icons` - 27 edges
7. `formatCurrency()` - 20 edges
8. `expo` - 12 edges
9. `get_current_user()` - 9 edges
10. `signin()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `signin()` --calls--> `get_db()`  [EXTRACTED]
  backend/app/routers/auth.py → backend/app/database.py
- `resend_otp()` --calls--> `get_db()`  [EXTRACTED]
  backend/app/routers/auth_signup.py → backend/app/database.py
- `signup()` --calls--> `get_db()`  [EXTRACTED]
  backend/app/routers/auth_signup.py → backend/app/database.py
- `verify_otp()` --calls--> `get_db()`  [EXTRACTED]
  backend/app/routers/auth_signup.py → backend/app/database.py
- `accept_invite()` --calls--> `get_db()`  [EXTRACTED]
  backend/app/routers/invites.py → backend/app/database.py

## Import Cycles
- None detected.

## Communities (25 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (56): api_route, AsyncIOMotorClient, Config, Settings, get_client(), get_db(), get_sanitized_uri(), ping_database() (+48 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (56): InviteAccept, InviteCreate, InviteResponse, BaseModel, BaseModel, ResendOtpRequest, UserCreate, UserLogin (+48 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (48): App(), getParams(), AuthFormInputs(), AuthHeader(), AuthScreen(), styles, OtpVerificationModal(), styles (+40 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (35): RFC-4180, main, name, private, scripts, android, build, ios (+27 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (11): Avatar(), styles, styles, styles, { width: SCREEN_W, height: SCREEN_H }, styles, EditProfileModal(), styles (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (15): CsvExportButton(), styles, exportExpensesToExcel(), calculatePropertyDebts(), buildPersonTables(), buildExpensesTable(), buildSettlementTable(), formatInr() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (20): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, expo, android (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (21): dependencies, cors, expo, expo-constants, expo-device, expo-file-system, expo-image-picker, expo-linear-gradient (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (10): ChronoAuditLogModal(), styles, AddExpenseModal(), styles, MemberChecklist(), SettlementHistoryModal(), styles, formatCurrency() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (9): BalanceCard(), styles, OweItem(), styles, styles, WhoOwesWhoCard(), DashboardContent(), styles (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.23
Nodes (7): AddPropertyModal(), styles, OtaLinksField(), styles, PropertyPickerModal(), styles, react-native

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (5): CategoryPickerField(), styles, CategoryFilters(), styles, categories

### Community 12 - "Community 12"
Cohesion: 0.31
Nodes (6): ExpenseItem(), styles, ExpenseList(), styles, getCategoryById(), formatDate()

### Community 13 - "Community 13"
Cohesion: 0.48
Nodes (4): SettleUpModal(), styles, buildUpiUri(), openUpiApp()

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

## Knowledge Gaps
- **66 isolated node(s):** `Config`, `apkbuildscript.sh script`, `name`, `slug`, `version` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 117 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `Community 10` to `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 16`, `Community 17`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Why does `react` connect `Community 8` to `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 16`, `Community 17`, `Community 18`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 7` to `Community 3`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `Config`, `apkbuildscript.sh script`, `name` to the rest of the system?**
  _66 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05507246376811594 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06521739130434782 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07960199004975124 - nodes in this community are weakly interconnected._