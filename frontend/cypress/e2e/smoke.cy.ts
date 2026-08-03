describe("CityFlow frontend", () => {
  it("affiche la page publique sans erreur", () => {
    cy.visit("/");
    cy.contains("CityFlow").should("be.visible");
  });
});
