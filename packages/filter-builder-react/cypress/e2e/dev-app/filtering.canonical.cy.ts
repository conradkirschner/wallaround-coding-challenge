describe('Canonical JSON editing', () => {
  it('applies a simple condition and updates result rows', () => {
    cy.visit('/');

    // Open canonical editor, type a simple condition and apply
    cy.getByTestId('canonical-editor')
      .find('textarea')
      .clear({ force: true })
      .type(
        JSON.stringify({ field: 'role', operator: 'eq', value: 'admin' }, null, 2),
        { parseSpecialCharSequences: false }
      );

    cy.getByTestId('canonical-editor').contains('button', 'Apply').click();

    // Expect at least one row and that every row's "role" is 'admin'
    cy.getByTestId('results').find('table tbody tr').should('have.length.at.least', 1);
    cy.getByTestId('results')
      .find('table tbody tr')
      .each(($tr) => {
        cy.wrap($tr).contains('td', 'admin');
      });
  });
});
