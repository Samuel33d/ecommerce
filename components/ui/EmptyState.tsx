import { HiOutlineShoppingBag } from 'react-icons/hi';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-surface-400 mb-5">
        {icon || <HiOutlineShoppingBag className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-semibold text-ink-900 font-display mb-1.5">{title}</h3>
      <p className="text-ink-500 text-sm text-center max-w-sm mb-5">
        {description}
      </p>
      {action}
    </div>
  );
}
