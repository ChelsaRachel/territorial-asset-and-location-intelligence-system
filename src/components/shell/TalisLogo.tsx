export function TalisLogo() {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-7 w-7 shrink-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/talis-logo-mark.svg')" }}
        aria-hidden="true"
      />
      <span className="font-display text-lg text-talis-green-900 leading-none">TALIS</span>
    </div>
  );
}
