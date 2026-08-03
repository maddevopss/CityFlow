describe("Pages publiques CityFlow", () => {
  const pages = [
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/accessibility",
  ];

  pages.forEach((path) => {
    it(`rend ${path} sans exposer l’espace authentifié`, () => {
      cy.visit(path);
      cy.get("main").should("exist");
      cy.get('nav[aria-label="Navigation publique"]').should("exist");
      cy.contains("Connexion").should("have.attr", "href", "/login");
      cy.get("body").should("not.contain", "Tableau de bord");
    });
  });

  it("offre des cibles publiques accessibles depuis l’accueil", () => {
    cy.visit("/");
    cy.get("h1").should("be.visible");
    cy.contains("Inscription").should("have.attr", "href", "/register");
  });

  it("protège le formulaire de contact avec un honeypot", () => {
    cy.visit("/contact");
    cy.get('input[name="website"]')
      .should("exist")
      .and("have.attr", "tabindex", "-1");
    cy.get('textarea[name="message"]').should(
      "have.attr",
      "maxlength",
      "4000",
    );
  });

  it("permet de refuser les témoins facultatifs", () => {
    cy.clearLocalStorage();
    cy.visit("/");
    cy.contains("Refuser les facultatifs").click();
    cy.window().then((win) =>
      expect(
        win.localStorage.getItem("cityflow-cookie-consent-v1"),
      ).to.contain("necessary"),
    );
  });
});
