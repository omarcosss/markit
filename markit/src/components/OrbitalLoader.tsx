import "./orbital.css";

interface OrbitalLoaderProps {
  label?: string;
}

export function OrbitalLoader({
  label = "Loading..."
}: OrbitalLoaderProps) {
  return (
    <div className="orbital-wrapper">
      <div className="orbital">
        <div className="orbital-ring" />
        <div className="orbital-dot" />
      </div>
      <span className="orbital-status">{label}</span>
    </div>
  );
}