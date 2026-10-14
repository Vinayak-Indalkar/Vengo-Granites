/**
 * Atomic Design Component System Barrel Export
 *
 * Atoms:
 * - StatusBadge: Semantic status pill
 * - StatCard: Summary metric card
 * - VengoLogo: Brand logo SVG
 *
 * Molecules:
 * - Breadcrumb: Hierarchy trail
 * - Pagination: Page navigation controls
 * - ActionDropdown: Dropdown menu with action confirmations
 * - DatePicker: Calendar picker
 * - PhotoUpload: Portrait / photo upload & preview
 * - FileUpload: Document drag & drop
 * - ConfirmDialog: Confirmation modal
 *
 * Organisms:
 * - DataTable: Complete enterprise data table
 * - FormDrawer: Slide-over form with confirmation
 * - ViewDrawer: Inspect record details slide-over
 * - Sidebar: App navigation sidebar
 * - Topbar: Header bar with profile, search & notifications
 *
 * Templates:
 * - AppLayout: Application container template
 * - HubLayout: Secondary tabbed navigation hub template
 */

// Atoms
export { StatusBadge, StatCard } from './atoms/BadgesAndMetrics';
export { VengoLogo } from './VengoLogo';

// Molecules
export { Breadcrumb, Pagination } from './molecules/NavigationControls';
export { ActionDropdown } from './molecules/ActionDropdown';
export { DatePicker, PhotoUpload, FileUpload } from './molecules/FormInputs';
export { ConfirmDialog } from './organisms/ModalsAndDrawers';

// Organisms
export { DataTable } from './organisms/DataTable';
export { FormDrawer, ViewDrawer, RowDetailsDrawer } from './organisms/ModalsAndDrawers';
export { Sidebar, Topbar } from './Navigation';

// Templates
export { AppLayout, HubLayout } from './templates/LayoutTemplates';
