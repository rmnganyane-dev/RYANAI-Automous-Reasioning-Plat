interface GreetingProps {
  name: string;
  subtitle?: string;
}

export function Greeting({ name, subtitle }: GreetingProps) {
  return (
    <>
      <h3 className="font-display font-bold text-lg text-cyan-200 mb-2 glow-cyan">{name}</h3>
      {subtitle && <p className="text-sm text-ink-400 max-w-md leading-relaxed">{subtitle}</p>}
    </>
  );
}