import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ErrorBoundary from "../components/ui/ErrorBoundary";

/** Composant qui lève une exception pendant le rendu. */
function Fragile({ explose }: { explose: boolean }) {
  if (explose) throw new Error("Erreur de rendu volontaire");
  return <p>Contenu sain</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React journalise l'erreur volontaire : on garde la sortie de test lisible.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("n'interfère pas quand le rendu se déroule normalement", () => {
    render(
      <ErrorBoundary>
        <Fragile explose={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Contenu sain")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("affiche un repli au lieu d'une page blanche", () => {
    render(
      <ErrorBoundary>
        <Fragile explose />
      </ErrorBoundary>,
    );

    const alerte = screen.getByRole("alert");
    expect(alerte).toBeInTheDocument();
    expect(alerte).toHaveTextContent("Une erreur est survenue");
    expect(alerte).toHaveTextContent("Recharger la page");
    expect(screen.queryByText("Contenu sain")).not.toBeInTheDocument();
  });

  it("permet de réessayer une fois la cause disparue", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [explose, setExplose] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setExplose(false)}>
            désamorcer
          </button>
          <ErrorBoundary>
            <Fragile explose={explose} />
          </ErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "désamorcer" }));
    await user.click(screen.getByRole("button", { name: /réessayer/i }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Contenu sain")).toBeInTheDocument();
  });

  it("propose un repli compact nommé par espace", () => {
    render(
      <ErrorBoundary space="Espace vendeur" compact>
        <Fragile explose />
      </ErrorBoundary>,
    );

    const alerte = screen.getByRole("alert");
    expect(alerte).toHaveTextContent("Cet écran n'a pas pu s'afficher");
    expect(alerte).toHaveTextContent("Espace vendeur");
    expect(alerte).toHaveTextContent("Retour à l'accueil");
  });
});
