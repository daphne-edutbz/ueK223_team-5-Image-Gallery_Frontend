const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Non-admin restrictions', () => {
  it('does not show create button for non-admin users', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Normal',
      lastName: 'User',
      roles: [{ id: 'role-user', name: 'USER', authorities: [] }]
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
      body: [user]
    }).as('getUsers');

    cy.intercept('GET', '/user/*', {
      statusCode: 200,
      body: user
    }).as('getUser');

    cy.visit('/gallery', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(user));
      }
    });

    cy.wait(['@getPosts', '@getUsers', '@getUser']);

    cy.get('button.MuiFab-root').should('not.exist');
  });
});
