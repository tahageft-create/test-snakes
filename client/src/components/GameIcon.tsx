export function GameIcon({ icon, color, size = "text-3xl" }: { icon: string; color?: string; size?: string }) {
  if (icon.startsWith("http") || icon.startsWith("/uploads")) {
    return (
      <img
        src={icon}
        alt=""
        className={`${size} rounded-lg object-cover w-full h-full`}
        style={{ backgroundColor: color ? `${color}20` : undefined }}
      />
    );
  }
  return <span className={size}>{icon}</span>;
}
