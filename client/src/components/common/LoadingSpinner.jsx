/**
 * Centered animated loading spinner.
 * @param {{ size?: string, className?: string }} props
 */
export default function LoadingSpinner({ size = 'h-10 w-10', className = '' }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div
        className={`${size} animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400`}
      />
    </div>
  );
}
