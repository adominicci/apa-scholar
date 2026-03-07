const msClass = 'material-symbols-outlined';

interface IconProps {
  className?: string;
}

export const HomeIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    dashboard
  </span>
);

export const SearchIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-sm ${className ?? ''}`}>
    search
  </span>
);

export const PlusIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-sm ${className ?? ''}`}>
    add_circle
  </span>
);

export const ChevronLeftIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    chevron_left
  </span>
);

export const ChevronRightIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    chevron_right
  </span>
);

export const FileTextIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    description
  </span>
);

export const BookOpenIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    auto_stories
  </span>
);

export const SettingsIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-[20px] ${className ?? ''}`}>
    settings
  </span>
);

export const InfoIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    info
  </span>
);

export const AlertTriangleIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    warning
  </span>
);

export const NotificationsIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-[20px] ${className ?? ''}`}>
    notifications
  </span>
);

export const DatabaseIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    database
  </span>
);

export const BookmarkIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-xl ${className ?? ''}`}>
    bookmark
  </span>
);

export const LibraryAddIcon = ({ className }: IconProps = {}) => (
  <span aria-hidden="true" className={`${msClass} text-sm ${className ?? ''}`}>
    library_add
  </span>
);
