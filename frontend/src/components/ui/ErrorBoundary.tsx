import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

/**
 * Frontière d'erreur React.
 *
 * Sans ce composant, une exception levée pendant le rendu démonte **tout**
 * l'arbre React et laisse une page blanche : aucun message, aucun moyen de
 * récupération, et l'utilisateur croit à une panne du site entier.
 *
 * Le repli est volontairement écrit en balisage autonome, sans aucun
 * composant de la bibliothèque d'UI : si c'est précisément l'un d'eux qui est
 * en cause, l'écran d'erreur doit pouvoir s'afficher quand même.
 *
 * Deux niveaux sont utilisés dans `App.tsx` :
 *  - une frontière **racine**, ultime rempart ;
 *  - une frontière **par espace** (public, client, vendeur, admin), afin
 *    qu'un écran défaillant n'emporte pas les autres.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  /** Nom de la zone protégée, affiché dans le repli. */
  space?: string;
  /** Repli compact, pour une section plutôt que pour toute l'application. */
  compact?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // En production, ce point d'entrée est celui d'un outil de supervision
    // (Sentry, OpenTelemetry…) : on y pousse l'erreur et la pile du composant.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  private readonly retry = (): void => {
    this.setState({ error: null });
  };

  private readonly reload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { space, compact } = this.props;

    return (
      <div
        role="alert"
        className={
          compact
            ? "mx-auto my-10 max-w-2xl rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center"
            : "flex min-h-screen items-center justify-center bg-surface px-6 py-16"
        }
      >
        <div className={compact ? "" : "w-full max-w-xl text-center"}>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error-container">
            <AlertTriangle size={26} className="text-on-error-container" aria-hidden />
          </div>

          <h1 className="font-display text-2xl font-semibold text-on-surface">
            {compact ? "Cet écran n'a pas pu s'afficher" : "Une erreur est survenue"}
          </h1>

          <p className="mt-3 text-body-md text-on-surface-variant">
            {compact
              ? "Le reste de votre espace continue de fonctionner normalement."
              : "L'application a rencontré un problème inattendu."}
            {space ? (
              <>
                {" "}
                <span className="text-on-surface-variant/80">({space})</span>
              </>
            ) : null}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.retry}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary transition-colors hover:bg-secondary"
            >
              <RefreshCw size={16} aria-hidden />
              Réessayer
            </button>

            {compact ? (
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-outline px-5 py-2.5 text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                <ArrowLeft size={16} aria-hidden />
                Retour à l'accueil
              </a>
            ) : (
              <button
                type="button"
                onClick={this.reload}
                className="inline-flex items-center gap-2 rounded-lg border border-outline px-5 py-2.5 text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                Recharger la page
              </button>
            )}
          </div>

          {import.meta.env.DEV && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-label-md text-on-surface-variant">
                Détail technique (visible en développement)
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-surface-container p-4 text-left text-xs text-on-surface-variant">
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
