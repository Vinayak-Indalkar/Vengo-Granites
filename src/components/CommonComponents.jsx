/**
 * CommonComponents.jsx
 * Backwards compatibility barrel export forwarding to Atomic Design components
 */

// Atoms
export { StatusBadge, StatCard } from './atoms/BadgesAndMetrics';

// Molecules
export { Breadcrumb, Pagination } from './molecules/NavigationControls';
export { ActionDropdown } from './molecules/ActionDropdown';
export { DatePicker, PhotoUpload, FileUpload } from './molecules/FormInputs';
export { ConfirmDialog } from './organisms/ModalsAndDrawers';

// Organisms
export { DataTable } from './organisms/DataTable';
export { FormDrawer, ViewDrawer, RowDetailsDrawer } from './organisms/ModalsAndDrawers';
