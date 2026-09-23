export default function PageLoader({ full = true }) {
  return (
    <div className={`${full ? 'min-h-[60vh]' : 'py-16'} flex items-center justify-center`} role="status" aria-label="Loading">
      <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-brand-400 animate-spin" />
    </div>
  );
}
