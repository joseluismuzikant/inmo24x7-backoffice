Please update the real project files of this backoffice to evolve it into a clean dual-mode app with minimum-change architecture.

Project goal:
Turn the current React backoffice into:

1. Admin mode
2. Tenant mode

Important constraints:
- Keep current login/auth flow working
- Do NOT do a big rewrite
- Prefer incremental, production-friendly changes
- Reuse existing backend endpoints where possible
- Only add minimal backend changes when strictly needed
- Respect existing auth/profile model:
  - tenant_id
  - role
  - is_admin

==================================================
1) FIRST: ANALYZE CURRENT CODEBASE BEFORE CHANGING
==================================================

Before coding, inspect the existing project structure and identify:

- current auth flow
- current router setup
- current dashboard/pages
- current API service files
- current session/profile loading
- any existing tenant, leads, properties, channels pages/components
- any existing backend integration for:
  - /admin/onboard
  - tenants
  - leads
  - properties
  - channels

Then implement the requested changes with MINIMUM necessary modifications.

==================================================
2) TARGET BEHAVIOR
==================================================

If logged user has:
- is_admin === true -> show admin mode
- is_admin === false -> show tenant mode

Admin user:
- can access admin pages
- can list tenants
- can create tenant
- can enable/disable tenant
- can delete tenant
- can view/filter leads by tenant
- can view/filter properties by tenant

Tenant user:
- cannot access admin pages
- can only access own tenant pages
- can only see own tenant data
- can manage only own notification channels

==================================================
3) AUTH / PROFILE SHARED STATE
==================================================

Implement a single shared auth/profile state using the current app patterns.

Required state after login:
- user.id
- user.email
- profile.tenant_id
- profile.role
- profile.is_admin

Create or adapt a single context/provider/hook equivalent so the rest of the app can access:
- current user
- current profile
- isAdmin
- tenantId
- role
- loading state
- auth/profile error state

Requirements:
- do not assume every user is admin
- do not assume tenant users can switch tenant
- tenant users must always operate only on their own tenant
- keep current login working
- load profile right after auth/session is known
- if profile is missing, show safe error state

Suggested shape:
- AuthProvider
- useAuth()

Expose at least:
- user
- profile
- isAdmin
- tenantId
- role
- loading
- refreshProfile()

==================================================
4) USER BADGE IN HEADER
==================================================

Add a top-right user badge visible in both admin and tenant mode.

It must show:
- small circle/avatar with initials
- email or display name
- role label

Role label examples:
- Admin
- Owner
- Manager
- Agent
- Viewer

Implement as reusable component, for example:
- components/UserBadge.jsx

Use role mapping for visual label:
- if is_admin true => Admin
- else use profile.role

==================================================
5) ROUTING / APP MODES
==================================================

Implement route guards or equivalent logic.

Admin mode routes:
- /admin/tenants
- /admin/tenants/new
- /admin/leads
- /admin/properties

Tenant mode routes:
- /leads
- /properties
- /notifications

Behavior:
- admin pages only for admin users
- tenant pages for normal tenant users
- if tenant user hits admin page -> redirect to /leads or show 403
- if admin lands on / -> redirect to /admin/tenants
- if tenant user lands on / -> redirect to /leads

Do not break current auth flow.

Suggested components:
- components/AdminRoute.jsx
- components/TenantRoute.jsx
- components/AppRedirect.jsx

==================================================
6) ADMIN MODE PAGES
==================================================

Create or adapt these pages cleanly:

A. /admin/tenants
Paginated tenants table.

Columns:
- tenant name
- slug
- status
- plan
- createdAt
- contact email
- actions

Actions:
- view tenant leads
- view tenant properties
- edit tenant channels / notifications
- enable tenant
- disable tenant
- delete tenant

Pagination required.

B. /admin/tenants/new
Create tenant form.

Fields:
- tenant name
- tenant slug
- owner email
- owner password
- optional notify email
- optional WhatsApp channel config
- optional plan

Submit:
- call POST /admin/onboard

Success UX:
- show success message
- show tenant_id
- show owner email
- quick link back to tenant list

If notify email / WhatsApp config exists:
- send in onboarding payload if backend supports it
- otherwise create channels after onboarding

C. /admin/leads
Paginated leads table.

Requirements:
- admin can see all leads
- filter by tenant
- tenant selector at top if useful

D. /admin/properties
Paginated properties table.

Requirements:
- admin can see all properties
- filter by tenant
- tenant selector at top if useful

==================================================
7) TENANT MODE PAGES
==================================================

Create or adapt these pages:

A. /leads
- show only current tenant leads
- paginated table
- simple search/filter if easy
- NO tenant selector

B. /properties
- show only current tenant properties
- paginated table
- NO tenant selector

C. /notifications
- show only current tenant channels
- list channels
- create channel
- edit channel
- activate/deactivate
- mark default

Very important:
Frontend must NOT allow tenant user to choose arbitrary tenant_id.
Tenant user must operate only on authenticated tenant data.

==================================================
8) API / SERVICES LAYER
==================================================

Keep API integration organized and minimal.

Suggested files:
- services/adminApi.js
- services/tenantApi.js

Reuse existing service structure if present.

Admin API methods needed:
- onboardTenant(payload)
- getTenants({ page, pageSize })
- updateTenantStatus(id, status)
- deleteTenant(id)
- getAdminLeads({ page, pageSize, tenant_id })
- getAdminProperties({ page, pageSize, tenant_id })
- getTenantChannelsAdmin(tenantId)
- createTenantChannelAdmin(tenantId, payload)
- updateChannelAdmin(channelId, payload)

Tenant API methods needed:
- getTenantLeads({ page, pageSize, search })
- getTenantProperties({ page, pageSize, search })
- getTenantChannels()
- createTenantChannel(payload)
- updateTenantChannel(id, payload)

==================================================
9) PAGINATION
==================================================

Apply pagination to:
- admin tenants
- admin leads
- admin properties
- tenant leads
- tenant properties

Frontend requirements:
- page
- pageSize
- next/prev or page buttons
- total if available

Create reusable pagination component if useful:
- components/Pagination.jsx

Backend/API response shape should support:
- items
- total
- page
- pageSize

If backend currently returns arrays only, minimally adapt it.

==================================================
10) BACKEND INTEGRATION RULES
==================================================

Use real existing backend endpoints where possible.

Prefer these capabilities:

Admin:
- POST /admin/onboard
- GET /admin/tenants?page=&pageSize=
- PATCH /admin/tenants/:id/status
- DELETE /admin/tenants/:id
- GET /api/leads?page=&pageSize=&tenant_id=
- GET /api/properties?page=&pageSize=&tenant_id=
- GET /admin/tenants/:id/channels
- POST /admin/tenants/:id/channels
- PATCH /admin/channels/:channelId

Tenant:
- GET /api/leads?page=&pageSize=
- GET /api/properties?page=&pageSize=
- GET /api/tenant/channels
- POST /api/tenant/channels
- PATCH /api/tenant/channels/:id

If some endpoints already exist:
- reuse them

If an endpoint is missing:
- implement the smallest backend change needed
- keep auth/security aligned with current backend model

==================================================
11) SECURITY / TENANT ISOLATION
==================================================

Critical rules:
- tenant users must never see data from other tenants
- tenant users must not be able to pass arbitrary tenant_id
- backend must resolve tenant from authenticated user for non-admin flows
- admin can filter by tenant_id
- admin-only actions must remain admin-only

If backend currently trusts tenant_id from client for normal users, fix it.

==================================================
12) UI / UX REQUIREMENTS
==================================================

Keep UI simple and consistent with the current app.

Need:
- loading states
- empty states
- error states
- success feedback after mutations
- confirmation modal or confirmation step for tenant delete
- disable buttons during submission
- optimistic update or refetch after enable/disable

Do not dump everything into one Dashboard component.

Suggested structure:
- pages/AdminTenants.jsx
- pages/AdminTenantCreate.jsx
- pages/AdminLeads.jsx
- pages/AdminProperties.jsx
- pages/TenantLeads.jsx
- pages/TenantProperties.jsx
- pages/TenantNotifications.jsx
- components/UserBadge.jsx
- components/Pagination.jsx
- components/AdminRoute.jsx
- services/adminApi.js
- services/tenantApi.js

You do NOT have to match this exactly if the project already has a better equivalent structure.
Prefer adapting current files over unnecessary duplication.

==================================================
13) IMPLEMENTATION STYLE
==================================================

Please:
- preserve existing patterns and naming where possible
- do not introduce unnecessary libraries
- avoid large-scale state-management refactor unless clearly needed
- keep components small and readable
- keep forms and tables practical
- avoid dead code
- remove obvious duplication if touched

==================================================
14) OUTPUT REQUIRED
==================================================

After completing the work, provide:

1. Summary of what was implemented
2. List of all changed files
3. For each changed file, explain briefly what changed
4. Any backend endpoints added/modified
5. Any assumptions made
6. Any TODOs left if something could not be fully completed

Very important:
Work directly on the real project files.
Do not just describe the solution.
Actually implement the changes.
 

 
Important execution mode:
- First inspect the codebase and detect what already exists
- Then implement only the necessary changes
- Keep diffs small
- Do not replace the whole app structure
- Show final changed files list at the end
 
