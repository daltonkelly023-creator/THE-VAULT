export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#0a1a3a] ${className}`} />
  );
}