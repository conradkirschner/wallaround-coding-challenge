import React from 'react';
import { JsonEditorCard } from '../../src/components/ui/JsonEditorCard';

describe('<JsonEditorCard />', () => {
  it('renders and applies', () => {
    const onApply = cy.stub().as('onApply');
    cy.mount(
      <JsonEditorCard
        title="Test JSON"
        value="{}"
        onChange={() => {}}
        onApply={onApply}
        okLabel="OK"
        testId="json-card"
      />
    );
    cy.getByTestId('json-card').contains('button', 'Apply').click();
    cy.get('@onApply').should('have.been.called');
  });
});
