// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PublicLayout from "./PublicLayout";

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<h1>Accueil public</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("PublicLayout", () => {
  it("expose une structure publique accessible et distincte", () => {
    renderLayout();

    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("main")).toHaveAttribute("id", "public-main-content");
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Accueil public" })).toBeTruthy();
  });

  it("offre les accès à l’authentification et aux pages légales", () => {
    renderLayout();

    expect(screen.getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Créer un compte" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "Confidentialité" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Accessibilité" })).toHaveAttribute("href", "/accessibility");
  });
});
