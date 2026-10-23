# Figma UI/UX Design Prompt — Ca Làm Online

## 1. Your Role

Act as a Senior Product Designer and UI/UX Designer specializing in modern SaaS products, workforce management systems, employee scheduling, and responsive web/mobile applications.

Design a practical, polished, production-inspired UI/UX prototype for **Ca Làm Online**, a shift scheduling and hourly wage management platform for small businesses such as coffee shops, restaurants, and retail stores.

The project already has a working backend API. Your task is to design the frontend experience based on the existing requirements, user roles, and API capabilities.

**Design the product, not a marketing website.** Focus on the actual application interfaces that store owners, managers, and employees will use every day.

## 2. Product Overview

Ca Làm Online helps small business owners and managers:

- Manage a store and its employees.
- Invite employees using a six-digit invitation code valid for 60 minutes.
- Assign hourly wages and employment types.
- Create and manage shift time slots.
- Build weekly employee schedules.
- Calculate estimated wages based on assigned shifts.
- Save schedules as drafts.
- Publish schedules and automatically send email notifications containing work schedules and estimated wages.

Employees use the mobile application to join a store, view their personal schedules, check estimated wages, and manage their profiles.

## 3. Platforms and User Roles

Design two separate application experiences.

### A. Web Application — Admin and Manager

Optimized for desktop and laptop screens.

**ADMIN — Store Owner**

- Register and log in.
- Create and manage their store.
- Generate and manage invitation codes.
- Invite employees directly using their account ID or email.
- View employees and update hourly wages.
- Promote employees to MANAGER or revoke manager privileges.
- Change employment types.
- Remove employees from the store.
- Create and manage shift time slots.
- Create, edit, save, and publish weekly schedules.
- View estimated payroll summaries.
- Manage personal profile and password.

**MANAGER — Store Manager**

- Log in and access the management interface.
- View store employees.
- Update hourly wages and employment types, according to backend permissions.
- Create and manage shifts.
- Create, edit, save, and publish schedules.
- Assign shifts to employees.
- Assign shifts to themselves when they also work as an employee.
- View estimated payroll summaries.
- Manage their personal profile.

Managers must not see or access owner-only actions such as promoting employees, revoking roles, or removing employees if those actions are restricted to ADMIN.

### B. Mobile Application — Employee

Optimized for mobile devices, using a mobile-first layout.

**EMPLOYEE**

- Register and log in.
- Join a store using a six-digit invitation code.
- View their personal weekly schedule.
- Navigate between previous, current, and upcoming weeks.
- View shift details and coworkers assigned to the same shift, when available.
- View total scheduled hours and estimated wages.
- View available in-app notification history, if supported by the implemented backend.
- Edit personal profile and change password.
- Log out.

Do not design manager or owner management dashboards for the mobile application in this version.

## 4. Visual Design Direction

Use a **Modern SaaS Dashboard with a warm, approachable visual identity**.

The application should feel professional enough for a real business, but friendly and easy to use for non-technical store owners and employees.

Avoid generic admin templates, excessive gradients, excessive glassmorphism, overly decorative elements, and unnecessarily complicated dashboards.

### Color Palette

Use this initial design system:

- Primary orange: `#EA701B`
- Light orange background: `#FFF0E5`
- Warm page background: `#FFF7F0`
- Card background: `#FFFFFF`
- Primary text: `#252525`
- Secondary text: `#64748B`
- Borders: `#E5E7EB`
- Success: `#16A34A`
- Warning: `#D97706`
- Error: `#DC2626`

Orange should emphasize primary actions, active navigation, selected dates, and important highlights. Do not make every component orange.

Use accessible text contrast and clear visual distinctions between Draft, Published, Loading, Empty, Success, and Error states.

### Typography

- Prefer Inter or Be Vietnam Pro.
- Use a clear typographic hierarchy.
- Make dates, times, and monetary amounts easy to scan.
- Use Vietnamese diacritics correctly.
- Use consistent font sizes, spacing, and component dimensions.

### Component Style

- Clean cards with subtle borders and restrained shadows.
- Consistent 10–14px corner radii.
- Comfortable spacing and readable tables.
- Simple outline icons.
- Clear button hierarchy.
- Reusable form controls, modals, badges, tabs, dropdowns, and confirmation dialogs.

All visible product UI text must be in **Vietnamese**.

Keep technical enum values such as `ADMIN`, `MANAGER`, `EMPLOYEE`, `DRAFT`, and `PUBLISHED` as internal values. Display friendly Vietnamese labels in the interface, such as “Chủ cửa hàng”, “Quản lý”, “Nhân viên”, “Bản nháp”, and “Đã xuất bản”.

## 5. Most Important Screen: Weekly Schedule Management

This is the core feature of the entire product. Spend the most design effort here.

Create a polished, practical scheduling interface inspired by well-designed workforce scheduling software and modern SaaS applications.

### Desktop Layout

Use a consistent application shell:

- Left sidebar for navigation.
- Top header with current store name, page title or breadcrumb, and profile menu.
- Main content area with sufficient horizontal space for a seven-day schedule grid.

Suggested sidebar navigation:

1. Tổng quan
2. Lịch làm việc
3. Nhân viên
4. Ca làm
5. Cửa hàng — ADMIN only
6. Hồ sơ cá nhân

Do not create unnecessary navigation items for features that do not exist in the current requirements.

### Schedule Header

Include:

- Page title: “Lịch làm việc”.
- Week selector.
- Previous week button.
- “Tuần hiện tại” button.
- Next week button.
- Current week date range.
- Clear Draft or Published status.
- A primary action for publishing when appropriate.

### Weekly Schedule Grid

Display seven columns representing Monday through Sunday and rows representing the store's available shift time slots.

Each schedule cell should show, when data is available:

- Shift name.
- Start and end times.
- Assigned employee name.
- Optional employee avatar or initials.
- Assignment status when relevant.

Empty cells should have a subtle “+ Phân ca” interaction.

Selecting a cell opens a modal or side panel where the manager can:

1. Select a shift.
2. Select an eligible employee.
3. Review the shift time.
4. Confirm the assignment or remove an existing assignment.

Make the grid readable even when there are many employees or shifts. Use horizontal scrolling if necessary rather than shrinking the content excessively.

The existing API represents assignments using `date`, `shiftId`, and `userId`. Design around this data model instead of assuming the backend supports a different scheduling structure.

### Weekly Payroll Summary

Below the schedule, design a compact but informative payroll summary.

Include:

- Number of assigned shifts.
- Total scheduled hours.
- Estimated wages for each employee.
- Hourly wage.
- Total estimated payroll for the store.

Example display:

- Nguyễn Văn A — 3 ca, 12 giờ × 20.000 VNĐ = 240.000 VNĐ.
- Trần Thị B — 5 ca, 20 giờ × 25.000 VNĐ = 500.000 VNĐ.

These are visual examples only. Use realistic sample data consistently throughout the prototype.

The summary should be easy to scan without overpowering the scheduling grid.

### Draft and Publish Workflow

Provide two distinct actions:

- Secondary button: “Lưu bản nháp”.
- Primary button: “Xác nhận & gửi email”.

Before publishing, show a confirmation dialog explaining that the schedule will be published and email notifications will be sent to employees.

After the operation, design a success or error feedback state.

Clearly communicate whether the current schedule is a draft or has been published.

Do not imply that saving a draft sends emails.

## 6. Other Web Screens

Design the following screens using the same design system.

### 6.1. Login — `/login`

- Email field.
- Password field with show/hide control.
- Login button.
- Link to registration.
- Inline validation and authentication error states.

### 6.2. Registration — `/register`

- Full name.
- Email.
- Password.
- Confirm password.
- Gender selector: Nam, Nữ, Khác.
- Age.
- Role selection using two clear cards or radio options:
  - Chủ cửa hàng.
  - Người đi làm.

Do not offer MANAGER as a registration option.

### 6.3. Store Management — `/store-management`

ADMIN only.

Include:

- Store name and address.
- Edit store information.
- Invitation code section.
- Generate a new six-digit invitation code.
- Display the code prominently after generation.
- Show the remaining validity time based on the backend's expiration timestamp, when available.
- Copy code button.
- Clear warning that generating a new code invalidates the previous code.
- Direct employee invitation using account ID or email.
- Invitation loading, success, expired-code, and error states.

Do not invent a QR-code invitation system because it is not part of the current requirements.

### 6.4. Employee Management — `/employees`

Include:

- Searchable employee table.
- Employee name and email.
- Employment type: Full-time or Part-time.
- Role badge.
- Hourly wage in Vietnamese đồng.
- Edit wage action.
- Edit employment type action.
- ADMIN-only promote/demote role action.
- ADMIN-only remove employee action, with a confirmation dialog.

Use compact, readable rows rather than oversized employee cards.

Sensitive actions should be visually distinct and require confirmation.

### 6.5. Shift Management — `/shifts`

Include:

- List of shift time slots.
- Shift name.
- Start time.
- End time.
- Duration in hours.
- Create shift button.
- Edit shift modal.
- Delete confirmation dialog.

Display clear validation errors when the time format is invalid or the end time is not after the start time.

### 6.6. Personal Profile — `/profile`

Include:

- Avatar.
- Full name.
- Email.
- Gender.
- Age.
- Edit profile.
- Change password.

Keep profile management simple and consistent with the rest of the application.

### 6.7. Dashboard — `/dashboard`

Create a lightweight overview page rather than a complex analytics dashboard.

Suggested content:

- Current store name.
- Total active employees.
- Upcoming schedule period.
- Number of assigned shifts.
- Estimated payroll for the selected week, when available.
- Quick actions for scheduling and employee management.
- A small preview of upcoming shifts or the current week's schedule.

Only display information that can reasonably be derived from the existing API. Avoid invented financial charts, revenue metrics, attendance tracking, or business analytics.

## 7. Mobile Application Screens

Create a separate mobile design system based on the same brand colors and typography.

Use realistic phone frames and a consistent bottom tab navigation.

### 7.1. Login and Registration

Create mobile-friendly versions of the authentication forms.

Ensure forms are usable with a mobile keyboard and have clear validation feedback.

### 7.2. Join Store — `JoinStoreScreen`

Display when an authenticated employee has not joined a store.

Include:

- A short explanation of the invitation process.
- Six-digit invitation code input.
- Join button.
- Loading and invalid/expired-code states.
- Success feedback.

The input must preserve leading zeros and accept exactly six digits.

### 7.3. My Weekly Schedule — `MyScheduleScreen`

This is the main mobile screen.

Include:

- Greeting and store name.
- Previous week, current week, and next week navigation.
- Current week date range.
- A horizontally scrollable week strip or seven-day selector.
- Clear upcoming shift cards.
- Shift name and time range.
- Total scheduled hours.
- Estimated weekly wages.
- Empty state when no shifts are assigned.

Prioritize the next upcoming shift and the estimated wages.

Do not force a seven-column desktop grid onto a narrow mobile screen.

### 7.4. Shift Details — `ShiftDetailScreen`

Show:

- Date.
- Shift name.
- Start and end times.
- Duration.
- Store information.
- Coworkers assigned to the same shift, if returned by the API.

### 7.5. Notifications — `NotificationScreen`

Design a clean notification history list for schedule updates and store invitations.

However, the currently documented API does not include a dedicated in-app notification history endpoint. Treat this screen as conditional on actual backend support. Do not represent sent email history as in-app notification history unless the backend explicitly provides that data.

### 7.6. Profile — `ProfileScreen`

Include:

- Avatar.
- Name and email.
- Edit personal information.
- Change password.
- Logout.

Use a simple three-tab bottom navigation:

1. Lịch làm
2. Thông báo
3. Cá nhân

## 8. Interaction and Prototype Requirements

Do not deliver only static, unrelated screens.

Create connected prototype flows for the most important user journeys:

**Flow A — Owner**

Register → Login → Create Store → Generate Invitation Code → Manage Employees → Create Shifts → Build Schedule → Save Draft → Publish Schedule.

**Flow B — Manager**

Login → View Employees → Edit Permitted Employee Information → Create Shifts → Assign Employees → Save Draft → Publish Schedule.

**Flow C — Employee**

Register → Login → Enter Invitation Code → View Weekly Schedule → Open Shift Details → View Profile.

Prototype interactions should include:

- Sidebar navigation.
- Buttons and modal opening/closing.
- Week navigation.
- Schedule-cell selection.
- Form validation states.
- Confirmation before destructive or consequential actions.
- Copy invitation code feedback.
- Draft/published status changes in the prototype.
- Loading, empty, success, and error states.

These interactions are for demonstrating the intended UX. They do not need to connect to the real backend.

## 9. Responsive Design

Prioritize desktop for the Web Admin/Manager application.

Design at least:

- Desktop: 1440px wide.
- Tablet or narrow desktop: approximately 1024px wide.
- Mobile: approximately 390px wide.

The mobile employee application should be designed as a true native mobile experience, not a scaled-down desktop dashboard.

## 10. Design System and Figma Organization

Organize the Figma file into these pages:

1. `00 - Cover & Overview`
2. `01 - Design System`
3. `02 - Web Authentication`
4. `03 - Web Dashboard`
5. `04 - Web Schedule Management`
6. `05 - Web Employees & Shifts`
7. `06 - Web Store Management`
8. `07 - Mobile Employee App`
9. `08 - Prototype Flows`

Create reusable components and variants for:

- Buttons.
- Inputs.
- Selects.
- Navigation items.
- Status badges.
- Employee rows.
- Shift cards.
- Schedule cells.
- Modals.
- Toast notifications.
- Empty states.
- Loading states.

Use Auto Layout, consistent spacing, meaningful layer names, and reusable color/text styles. Keep the file organized so the design can later be implemented in React, Tailwind CSS, and React Native.

## 11. Backend Compatibility and Constraints

The backend already exists and exposes REST APIs.

Do not redesign the product around imaginary endpoints or add unrelated business features.

Use the documented API capabilities as the source of truth:

- Authentication and current-user profile.
- Store management and invitation codes.
- Employee management and hourly wages.
- Employment type and role management.
- Shift CRUD operations.
- Weekly schedule retrieval.
- Draft schedule saving.
- Schedule publishing and email delivery.
- Employee personal schedule retrieval.

Some API details, such as exact response fields, pagination, avatar upload behavior, and in-app notification history, may need verification. Represent uncertain data conservatively.

The frontend must visually respect role-based permissions, but remember that real authorization is enforced by the backend.

Do not add new backend features merely to justify a UI element.

## 12. Out of Scope

Do not design or add:

- Attendance check-in or check-out.
- GPS tracking.
- Payroll payment processing.
- Leave requests.
- Employee performance analytics.
- Revenue dashboards.
- Chat or messaging.
- Zalo bot integration.
- Push notifications requiring new infrastructure.
- Multi-branch management unless explicitly supported by the existing backend.
- AI scheduling or automated optimization.
- Complex enterprise permission management.

The goal is a focused and achievable portfolio project.

## 13. Final Deliverables

Produce a cohesive, high-fidelity Figma prototype with:

1. A consistent visual identity.
2. A complete web application design for ADMIN and MANAGER.
3. A mobile application design for EMPLOYEE.
4. A detailed weekly scheduling and payroll interface.
5. Reusable components and a design system.
6. Realistic Vietnamese sample content and monetary formatting.
7. Connected prototype flows.
8. Responsive layouts for the major screens.
9. Clear loading, empty, error, success, draft, and published states.
10. A practical layout that a developer can implement without guessing the intended behavior.

**Priority order:** Weekly Schedule Management → Employee Management → Mobile My Schedule → Store Management → Authentication → Shift Management → Dashboard and Profile.

Make sensible design decisions independently. Do not stop to ask questions unless an essential requirement is genuinely ambiguous. Favor usability, consistency, and realistic implementation over visual decoration.

The final result should look like a credible, polished workforce management product that could be demonstrated to real users and included in a web developer portfolio.