import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "../context/ToastContext";
import Collections from "../pages/public/Collections";
import About from "../pages/public/About";
import Blog from "../pages/public/Blog";
import BlogPost from "../pages/public/BlogPost";
import Contact from "../pages/public/Contact";
import NotFound from "../pages/public/NotFound";

function mount(ui: React.ReactNode, route = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{ui}</ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("pages publiques éditoriales", () => {
  it("Collections affiche les collections", () => {
    mount(<Collections />);
    expect(screen.getByRole("heading", { level: 1, name: "Nos collections" })).toBeInTheDocument();
  });

  it("À propos affiche la présentation", () => {
    mount(<About />);
    expect(screen.getByText("Ce qui nous anime")).toBeInTheDocument();
  });

  it("Blog liste les articles", () => {
    mount(<Blog />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Le journal d'Anti/ }),
    ).toBeInTheDocument();
  });

  it("BlogPost rend un article existant", () => {
    mount(
      <Routes>
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>,
      "/blog/entretenir-meubles-bois-massif",
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("BlogPost affiche un repli sur un slug inconnu", () => {
    mount(
      <Routes>
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>,
      "/blog/ce-slux-nexiste-pas",
    );
    expect(screen.getByText("Article introuvable")).toBeInTheDocument();
  });

  it("Contact affiche le formulaire", () => {
    mount(<Contact />);
    expect(screen.getByRole("heading", { level: 1, name: "Contactez-nous" })).toBeInTheDocument();
  });

  it("NotFound affiche la page 404", () => {
    mount(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Cette page a déménagé")).toBeInTheDocument();
  });
});
