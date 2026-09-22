import PageLoader from "./PageLoader";

/** Variante plein écran des états de chargement (§84). */
export default function FullPageLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <PageLoader label={label} />
    </div>
  );
}
