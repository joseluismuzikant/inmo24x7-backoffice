I want to evolve this backoffice into a dual-mode app:

1. Admin mode
2. Tenant mode

Current context:
- React backoffice
- Supabase auth already exists
- backend already supports:
  - profiles with:
    - tenant_id
    - role
    - is_admin
  - admin onboarding endpoints
  - tenant_channels
  - tenants
  - leads
  - properties
- I want minimum-change, clean evolution, not a big refactor

Main goal:
If the logged user is admin (`is_admin === true`), show admin pages.
If the logged user is not admin, show tenant-only pages.

================================
A) AUTH / PROFILE LOADING
================================

Please update the app so that after login it loads the current user profile from Supabase / backend and keeps in state:

- user id
- email
- tenant_id
- role
- is_admin

I need a single auth/profile context or equivalent shared state so the rest of the app can know:
- who is logged in
- if user is admin
- what tenant belongs to the user
- what role the user has

Important:
- do not assume every user is admin
- do not assume tenant users can switch tenant
- tenant users must always operate only on their own tenant

================================
B) HEADER / USER BADGE
================================

Add a top-right user badge visible in the app with:

- a small circle/avatar with initials
- user email or display name
- role label

Examples:
- Admin
- Owner
- Manager
- Agent
- Viewer

This should be visible in both admin and tenant mode.

================================
C) ROUTING / APP MODES
================================

I want two navigation modes.

1. Admin mode (`is_admin === true`)
Pages:
- /admin/tenants
- /admin/tenants/new
- /admin/leads
- /admin/properties

2. Tenant mode (`is_admin === false`)
Pages:
- /leads
- /properties
- /notifications

Please implement route guards or equivalent logic:

- admin pages only for admin users
- tenant pages for normal tenant users
- if a tenant user tries to access admin pages, redirect or show 403
- if admin lands in the app root, redirect to /admin/tenants
- if tenant user lands in the app root, redirect to /leads

Do not break existing auth flow.

================================
D) ADMIN MODE FEATURES
================================

I want these admin pages:

--------------------------------
1. Admin Tenants List
--------------------------------

Page: /admin/tenants

Show paginated table of tenants.

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

Use backend API.
If needed, implement/adapt these endpoints:
- GET /admin/tenants?page=&pageSize=
- PATCH /admin/tenants/:id/status
- DELETE /admin/tenants/:id

Pagination required.

--------------------------------
2. Admin Create Tenant
--------------------------------

Page: /admin/tenants/new

Form fields:
- tenant name
- tenant slug
- owner email
- owner password
- optional notify email
- optional WhatsApp channel config
- optional plan

Submit should call backend onboarding endpoint:
- POST /admin/onboard

Expected UX after success:
- show confirmation
- show tenant_id
- show owner email
- allow quick link back to tenant list

If notify email / whatsapp config is provided:
- either send together if backend already supports it
- or call channel creation after onboarding

--------------------------------
3. Admin Leads
--------------------------------

Page: /admin/leads

Show paginated table of leads.

Requirements:
- filter by tenant
- pagination
- admin can see all leads
- optional tenant selector at top

API should support:
- GET /api/leads?page=&pageSize=&tenant_id=

--------------------------------
4. Admin Properties
--------------------------------

Page: /admin/properties

Show paginated table of properties.

Requirements:
- filter by tenant
- pagination
- admin can see all properties
- optional tenant selector at top

API should support:
- GET /api/properties?page=&pageSize=&tenant_id=

--------------------------------
5. Enable / Disable Tenant
--------------------------------

In tenant list actions:
- if active -> show Disable
- if disabled -> show Enable

Call:
- PATCH /admin/tenants/:id/status

Body:
- { "status": "active" }
- { "status": "disabled" }

Update UI optimistically or refetch list.

--------------------------------
6. Delete Tenant
--------------------------------

In tenant list actions:
- show Delete with confirmation modal

Call:
- DELETE /admin/tenants/:id

Only admin can do this.

================================
E) TENANT MODE FEATURES
================================

I want tenant-only pages where the tenant user sees only its own data.

Important rule:
Frontend must not allow choosing tenant_id for tenant users.
Backend must use authenticated tenant automatically.

--------------------------------
1. Tenant Leads
--------------------------------

Page: /leads

Show only leads for current tenant user.

Requirements:
- paginated table
- maybe simple search/filter
- no tenant selector
- use current tenant from auth

API:
- GET /api/leads?page=&pageSize=
Backend should resolve tenant from logged user for non-admin users.

--------------------------------
2. Tenant Properties
--------------------------------

Page: /properties

Show only properties for current tenant.

Requirements:
- paginated table
- no tenant selector
- use current tenant from auth

API:
- GET /api/properties?page=&pageSize=

--------------------------------
3. Tenant Notifications
--------------------------------

Page: /notifications

Show and manage only the current tenant’s notification channels.

Requirements:
- list channels
- create channel
- edit channel
- activate/deactivate
- mark default

Use tenant-specific endpoints if they exist, or create/adapt them.
Suggested backend endpoints:
- GET /api/tenant/channels
- POST /api/tenant/channels
- PATCH /api/tenant/channels/:id

If backend already uses /admin/... for channels, do not expose admin endpoints directly to tenant UI unless they are secured correctly.
Prefer tenant-specific endpoints for tenant users.

================================
F) PAGINATION
================================

Tenants, leads, and properties must be paginated.

Frontend:
- page
- pageSize
- next/prev or page buttons
- total count if available

Backend:
Please adapt endpoints so they return enough pagination data, for example:
- items
- total
- page
- pageSize

Apply pagination to:
- admin tenants
- admin leads
- admin properties
- tenant leads
- tenant properties

================================
G) UI STRUCTURE
================================

Please keep the change clean and minimal.

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
- components/AdminRoute.jsx or equivalent
- services/adminApi.js
- services/tenantApi.js

You do not have to follow this exactly, but keep code organized and avoid putting everything into one Dashboard component.

================================
H) BACKEND INTEGRATION
================================

Please use the real existing backend endpoints where possible.

If an endpoint is missing, add the minimum backend change needed.

I likely need these backend capabilities working cleanly:

Admin:
- POST /admin/onboard
- GET /admin/tenants
- PATCH /admin/tenants/:id/status
- DELETE /admin/tenants/:id
- GET /api/leads?tenant_id=
- GET /api/properties?tenant_id=
- GET /admin/tenants/:id/channels
- POST /admin/tenants/:id/channels
- PATCH /admin/channels/:channelId

Tenant:
- GET /api/leads
- GET /api/properties
- GET /api/tenant/channels
- POST /api/tenant/channels
- PATCH /api/tenant/channels/:id

If some of these already exist, reuse them.
If not, implement the missing ones with minimal change.

================================
I) IMPORTANT RULES
================================

- Do not break current login
- Do not break existing dashboard pages unnecessarily
- Do not do a big rewrite
- Keep changes incremental and production-friendly
- Respect current auth/profile model:
  - tenant_id
  - role
  - is_admin
- Admin can see all tenants and filter data by tenant
- Tenant users can only see and manage their own data
- Add clear loading / error / success states
- Show me all changed files at the end
- If backend changes are needed, implement them too

================================
J) EXPECTED RESULT
================================

After this work, I want:

Admin user:
- logs in
- sees user badge with name/email and role
- can create tenant
- can list tenants
- can enable/disable/delete tenants
- can view leads and properties filtered by tenant
- all paginated

Tenant user:
- logs in
- sees user badge with name/email and role
- can only see own leads
- can only see own properties
- can configure own notifications
- all paginated where applicable

Please work directly on the real project files and keep the implementation simple and clean.

