describe('Example app — smoke', () => {
  it('loads the demo and renders core panels', () => {
    cy.visit('/');

    cy.contains('h1', 'Filter Builder (Demo)').should('be.visible');
    cy.getByTestId('request-tester').should('exist');
    cy.getByTestId('rows-editor').should('exist');
    cy.getByTestId('fields-editor').should('exist');
    cy.getByTestId('ops-editor').should('exist');
    cy.getByTestId('filter-builder').should('exist');
    cy.getByTestId('canonical-editor').should('exist');
    cy.getByTestId('results').should('exist');
  });
});
