# Design Guidelines: Multi-Platform Social Media Management Dashboard

## Design Approach

**Selected Approach**: Hybrid - Professional Dashboard System inspired by modern social media management tools (Buffer, Hootsuite, Later) combined with productivity app clarity (Linear, Notion)

**Core Principles**:
- Efficiency-first: Enable rapid content creation and publishing
- Visual clarity: Clear status indicators and platform differentiation
- Professional trust: Polished, reliable interface for business users
- Content-centric: Composer and previews take visual priority

---

## Typography System

**Font Families**:
- Primary: Inter (headings, UI elements, buttons)
- Secondary: system-ui (body text, form inputs)

**Type Scale**:
- Hero/Page Titles: text-3xl to text-4xl, font-semibold
- Section Headers: text-xl to text-2xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-base, font-normal
- Metadata/Labels: text-sm, font-medium
- Captions/Helpers: text-xs to text-sm, font-normal

**Hierarchy**:
- Dashboard titles bold and prominent
- Platform names always capitalized and medium weight
- Status messages use appropriate weight (success: medium, error: semibold)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 to p-8
- Section margins: mb-8 to mb-12
- Card gaps: gap-6 to gap-8
- Tight spacing: space-y-2
- Standard spacing: space-y-4 to space-y-6

**Grid Structure**:
- Main dashboard: Two-column split (sidebar + main content)
- Sidebar: Fixed width 256px (w-64)
- Content area: Flexible with max-w-7xl container
- Composer: Full-width with constrained preview grid
- Post history: Grid of 2-3 columns (responsive)

**Container Widths**:
- Page container: max-w-7xl mx-auto
- Composer area: max-w-5xl
- Form sections: max-w-2xl
- Preview cards: Flexible within grid

---

## Component Library

### Navigation & Structure

**Top Navigation Bar**:
- Fixed header with app logo/name (left), user profile dropdown (right)
- Height: h-16
- Shadow: subtle shadow-sm
- Search bar centered (if applicable)

**Sidebar Navigation**:
- Fixed left sidebar with primary navigation
- Icons + labels for: Dashboard, Composer, Post History, Connected Accounts, Analytics, Settings
- Active state: distinct background treatment
- Collapse option for smaller screens

**Dashboard Layout**:
- Grid of metric cards showing connected platforms, scheduled posts, recent activity
- Each card: rounded-lg with border and shadow-sm
- Metric emphasis: large numbers (text-3xl) with descriptive labels below

### Content Composer

**Main Composer Interface**:
- Large textarea for post content (min-h-48)
- Character counter with platform-specific limits displayed
- Media upload zone with drag-and-drop visual feedback
- Platform selector checkboxes with distinctive icons (LinkedIn, Instagram, X, Facebook)

**Platform Preview Panel**:
- Grid layout showing 2x2 or 1x4 previews (responsive)
- Each preview card mimics actual platform appearance
- Platform icon/name header on each preview
- Border distinguishes selected vs. unselected platforms

**Action Buttons**:
- Primary CTA: "Publish Now" (prominent, filled button)
- Secondary: "Schedule" (outlined button)
- Tertiary: "Save Draft" (ghost/text button)
- Positioned at bottom-right of composer

### Post History Dashboard

**Post Cards**:
- Horizontal cards showing thumbnail, content excerpt, platforms, timestamp
- Grid layout: 2-3 columns on desktop, 1 column on mobile
- Platform badges: Small colored tags (LinkedIn blue, Instagram gradient, X black, Facebook blue)
- Status indicators: Success (checkmark), Failed (alert), Scheduled (clock icon)

**Filters & Search**:
- Top bar with platform filters, date range selector, search input
- Compact, single row layout
- Clear filter pills showing active selections

### Account Connection Interface

**Platform Connection Cards**:
- Large cards for each platform (LinkedIn, Instagram, X, Facebook)
- Platform logo/icon prominent
- Connection status: "Connected" with checkmark or "Connect" button
- Account details when connected (profile picture, username)
- Disconnect option subtle but accessible

**OAuth Flow Screens**:
- Centered modal or dedicated page
- Platform branding maintained
- Clear permission explanations
- Progress indicators during connection

### Notifications & Feedback

**Status Notifications**:
- Toast/snackbar notifications (top-right corner)
- Success: subtle with checkmark icon
- Error: attention-grabbing with alert icon
- Auto-dismiss with manual close option
- Stack multiple notifications vertically with gap-2

**Publishing Status Panel**:
- During publishing: modal overlay showing platform-by-platform progress
- Each platform: name, loading spinner/checkmark/error icon, status message
- Overall progress bar at top

### Forms & Inputs

**Text Inputs**:
- Rounded corners (rounded-md)
- Clear labels above inputs
- Placeholder text for guidance
- Focus states: subtle border emphasis
- Error states: border treatment with error message below

**Buttons**:
- Primary: Solid fill, medium rounding (rounded-md)
- Secondary: Border with transparent fill
- Size variants: px-4 py-2 (default), px-6 py-3 (large)
- Icons paired with text where appropriate

**Toggles & Checkboxes**:
- Platform selection: checkboxes with platform icons
- Settings: toggle switches for boolean options
- Radio groups: for mutually exclusive choices (publish vs. schedule)

---

## Responsive Behavior

**Breakpoints**:
- Mobile: Stack all content single-column, hide sidebar (hamburger menu)
- Tablet (md:): Two-column layouts begin, sidebar collapsible
- Desktop (lg:): Full multi-column layouts, fixed sidebar

**Mobile Optimizations**:
- Bottom navigation bar instead of sidebar
- Composer: Full-screen experience
- Preview: Swipeable carousel instead of grid
- Post history: Single column cards

---

## Visual Treatments

**Elevation & Depth**:
- Flat design with subtle shadows (shadow-sm for cards)
- Elevated modals: shadow-xl with backdrop
- Interactive elements: Subtle shadow on hover

**Borders & Dividers**:
- Card borders: border with subtle opacity
- Section dividers: border-t or border-b where needed
- Focus rings: Remove default, add custom treatment

**Icons**:
- Use Heroicons for UI elements (outline style for navigation, solid for status)
- Platform-specific icons for LinkedIn, Instagram, X, Facebook
- Consistent sizing: w-5 h-5 for inline, w-6 h-6 for standalone

---

## Images

**Dashboard Hero Area** (if included):
- Not a traditional marketing hero
- Could include welcome banner with subtle illustration (illustration of connected social platforms)
- Compact height (h-40 to h-48)
- User's profile banner or motivational graphic

**Empty States**:
- Illustration for "No posts yet" in history
- Graphic for "Connect your first account"
- Simple, friendly visuals encouraging action

**Platform Previews**:
- User-uploaded media displayed in preview cards
- Placeholder images when no media uploaded
- Maintain aspect ratios per platform requirements

**Profile Pictures**:
- Circular avatars in navigation and account cards
- Sizes: w-8 h-8 (small), w-12 h-12 (medium), w-16 h-16 (large)

---

## Interaction Patterns

**Hover States**:
- Cards: Subtle elevation increase (shadow-md)
- Buttons: Slight opacity or shade change
- Navigation items: Background treatment

**Loading States**:
- Skeleton screens for post history while loading
- Spinner for active publishing
- Progress bars for uploads

**Error Handling**:
- Inline validation messages below form fields
- Alert banners for system-wide issues
- Helpful error messages with actionable suggestions

---

## Platform-Specific Design Elements

**Platform Badges/Pills**:
- LinkedIn: Blue accent
- Instagram: Gradient accent
- X (Twitter): Black accent
- Facebook: Blue accent
- Small, rounded-full badges next to post content

**Preview Cards**:
- Mimic platform UI patterns (card styles, button appearances)
- Show character limits and formatting
- Display how images will crop on each platform

---

This design system creates a professional, efficient social media management dashboard that prioritizes content creation and multi-platform publishing while maintaining visual clarity and user trust.