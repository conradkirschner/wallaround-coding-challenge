// cypress/code-coverage.d.ts
declare module '@cypress/code-coverage/task' {
  const task: (
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions
  ) => Cypress.PluginConfigOptions | void | Promise<Cypress.PluginConfigOptions | void>;
  export default task;
}

declare module '@cypress/code-coverage/support';
