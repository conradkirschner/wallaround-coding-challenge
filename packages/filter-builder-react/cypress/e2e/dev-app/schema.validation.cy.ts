describe('Schema editing & validation', () => {
  it('shows an error for invalid field type', () => {
    cy.visit('/');

    const invalidFields = [
      { key: 'id', label: 'ID', type: 'x' }, // invalid type
    ];

    cy.getByTestId('fields-editor')
      .find('textarea')
      .clear({ force: true })
      .type(JSON.stringify(invalidFields, null, 2), { parseSpecialCharSequences: false });

    cy.getByTestId('fields-editor').contains('button', 'Apply').click();

    // Expects a red error message present (we don’t assert exact text to stay robust to validator wording)
    cy.getByTestId('fields-editor').within(() => {
      cy.get('p.text-red-700').should('exist');
    });
  });
});
