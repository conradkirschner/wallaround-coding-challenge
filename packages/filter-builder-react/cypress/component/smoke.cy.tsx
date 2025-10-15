// cypress/component/smoke.cy.tsx
import React from 'react';

function Chip() {
  return <span data-test-id="chip">Hello</span>;
}

describe('smoke', () => {
  it('mounts and finds by test id', () => {
    cy.mount(<Chip />);
    cy.getByTestId('chip').should('have.text', 'Hello');
  });
});
