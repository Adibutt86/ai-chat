# 👑 Master Admin & Role Access Management Guide

This guide explains how Role-Based Access Control (RBAC) works in your Chatbot application, how tabs are hidden from standard users, and how to grant or modify **Master Admin** privileges.

---

## 🎭 User Roles Breakdown

| Role Name | Scope | Accessible Tabs |
| :--- | :--- | :--- |
| **`admin` / `owner`** | **Master Admin** | **All 10 Tabs**: Dashboard Overview, AI Agents, Training (Knowledge Base), Conversations, Leads, Bookings, Services, Business Hours, Widget Customizer, System Settings |
| **`user` / `member`** | **Standard User** | **Operational Tabs Only** (7 Tabs): Dashboard Overview, Conversations, Leads, Bookings, Services, Business Hours, Widget Customizer |

> [!NOTE]
> For **Standard Users**, management tabs (*AI Agents*, *Training*, *System Settings*) are automatically hidden from the sidebar. If a standard user manually types `?tab=settings` or `?tab=training` into their browser address bar, the system automatically redirects them back to the allowed **Dashboard Overview** tab.

---

## 🛠️ How to Edit User Roles / Assign Master Admin Privileges

### Method 1: Using Prisma Studio (Graphical Database UI)
1. Open your terminal in the project directory (`C:\chatbot`).
2. Run the following command:
   ```bash
   npx prisma studio
   ```
3. Open `http://localhost:5555` in your web browser.
4. Click on the **User** model table.
5. Locate the target user by email and change their `role` column value:
   - Change to **`admin`** for Master Admin access.
   - Change to **`user`** for Standard restricted access.
6. Click **Save 1 Change** at the bottom of Prisma Studio.

---

### Method 2: Direct SQL Command (PostgreSQL / Supabase)
Execute the following SQL query in your database management console:

```sql
-- Grant Master Admin privileges to a user
UPDATE "User"
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Revoke Master Admin privileges (Demote to Standard User)
UPDATE "User"
SET role = 'user'
WHERE email = 'your-email@example.com';
```

---

### Method 3: Via System Settings (Inside Dashboard)
1. Log in as a **Master Admin**.
2. Click on the **Settings** tab in the sidebar.
3. Scroll down to **Add Team Members**.
4. Enter the team member's email address and select **Administrator** from the role dropdown.

---

## 🔄 How to Undo / Revert Changes

A git backup checkpoint was created before applying these role-based updates. If you ever need to restore the codebase to the exact previous state:

1. Open PowerShell or Command Prompt in `C:\chatbot`.
2. Run the following command:
   ```bash
   git reset --hard eea63e2
   ```

---

## 📁 Technical Reference Files
- **Permissions Central Config**: [`src/lib/permissions.ts`](file:///C:/chatbot/src/lib/permissions.ts)
- **Sidebar Menu Filtering**: [`src/app/components/Sidebar.tsx`](file:///C:/chatbot/src/app/components/Sidebar.tsx)
- **Dashboard Guard Logic**: [`src/app/dashboard/page.tsx`](file:///C:/chatbot/src/app/dashboard/page.tsx)
- **API Guard Helper**: [`src/lib/api-auth.ts`](file:///C:/chatbot/src/lib/api-auth.ts)
