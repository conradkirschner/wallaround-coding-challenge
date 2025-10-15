declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('getByTestId', (id: string) =>
  cy.get(`[data-test-id="${id}"]`)
);

export {};
