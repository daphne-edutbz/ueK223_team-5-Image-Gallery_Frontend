const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Admin create post validation', () => {
  it('shows error for invalid image URL', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'admin-1', exp: nowSeconds + 3600 });
    const adminUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: [{ id: 'role-admin', name: 'ADMIN', authorities: [] }]
    };

    cy.intercept('GET', '/api/image-posts*', {
      statusCode: 200,
      body: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 12
      }
    }).as('getPosts');

    cy.intercept('GET', '/user', {
      statusCode: 200,
      body: [adminUser]
    }).as('getUsers');

    cy.intercept('GET', '/user/*', {
      statusCode: 200,
      body: adminUser
    }).as('getUser');

    cy.intercept('POST', '/api/image-posts').as('createPost');

    cy.visit('/gallery', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(adminUser));
      }
    });

    cy.wait(['@getPosts', '@getUsers', '@getUser']);

    cy.get('button.MuiFab-root').click();
    cy.get('input[placeholder="https://example.com/bild.jpg"]').type('not-a-url');
    cy.contains('Speichern').click();

    cy.contains('Bitte gib eine gültige URL ein').should('be.visible');
    cy.get('@createPost.all').should('have.length', 0);
  });
});
