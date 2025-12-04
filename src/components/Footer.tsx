import { Wifi } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-6 px-4 text-center border-t border-border mt-8">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Wifi className="w-4 h-4" />
        <span>Made for local use - No Internet required</span>
      </div>
      <p className="text-xs text-muted-foreground/70 mt-2">
        Data is stored securely in your browser's local storage
      </p>
    </footer>
  );
}
