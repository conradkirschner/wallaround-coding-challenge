describe('Request tester', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('stubs a GET request and uses response as rows', () => {
    // Intercept GET to a same-origin path
    cy.intercept('GET', '/api/mock*', { fixture: 'rows.products.json' }).as('getMock');

    cy.getByTestId('request-tester').within(() => {
      // url input
      cy.getByTestId('request-tester__url').clear().type('/api/mock');
      cy.contains('button', 'Send').click();
    });

    cy.wait('@getMock');

    // Table shows 2 rows from fixture
    cy.getByTestId('results').find('table tbody tr').should('have.length', 2);
  });

  it('stubs a POST request and uses response as rows', () => {
    cy.intercept('POST', '/api/mock', { fixture: 'rows.products.json' }).as('postMock');

    cy.getByTestId('request-tester').within(() => {
      // Switch to POST
      cy.contains('button', /POST/i).click();

      // url input
      cy.getByTestId('request-tester__url').clear().type('/api/mock');

      // optional: reset body if UI exposes the reset button
      cy.contains('button', /Reset Body/i)
        .click({ force: true })
        .then(() => {});

      cy.contains('button', 'Send').click();
    });

    cy.wait('@postMock');

    cy.getByTestId('results').find('table tbody tr').should('have.length', 2);
  });
});
