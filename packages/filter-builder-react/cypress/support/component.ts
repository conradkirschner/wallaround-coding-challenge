/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import './commands.component';

import { mount } from 'cypress/react';

// Make mount available as a command
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
Cypress.Commands.add('mount', (component, options) => {
  ensureCyRoot();
  return mount(component, options);
});

// Ensure CT root exists even if indexHtmlFile isn't picked up for some reason
function ensureCyRoot() {
  let el = document.querySelector('[data-cy-root]');
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('data-cy-root', '');
    document.body.appendChild(el);
  }
}
