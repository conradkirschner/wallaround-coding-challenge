import '@cypress/code-coverage/support';

Cypress.Commands.add('dataTest', (id) => cy.get(`[data-test-id="${id}"]`));
