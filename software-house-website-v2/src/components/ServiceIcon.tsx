const icons: Record<string, string> = {
  code: "\u{1F4BB}",
  brain: "\u{1F9E0}",
  cloud: "\u{2601}\u{FE0F}",
  build: "\u{1F3D7}\u{FE0F}",
  cart: "\u{1F6D2}",
  saas: "\u{1F310}",
  dashboard: "\u{1F4CA}",
  globe: "\u{1F30D}",
  workflow: "\u{1F504}",
  agent: "\u{1F916}",
  deploy: "\u{1F680}",
  briefcase: "\u{1F4BC}",
  integrate: "\u{1F9F0}",
  architecture: "\u{1F3D7}\u{FE0F}",
  "deploy-cloud": "\u{2601}\u{FE0F}\u{1F680}",
};

export default function ServiceIcon({ icon, className = "text-2xl" }: { icon: string; className?: string }) {
  return <span className={className}>{icons[icon] || "\u{1F4BB}"}</span>;
}
