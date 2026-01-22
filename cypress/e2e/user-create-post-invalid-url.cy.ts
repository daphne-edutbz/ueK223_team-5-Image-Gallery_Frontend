const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('User create post validation', () => {
  it('shows error for invalid image URL', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Normal',
      lastName: 'User',
      roles: []
    };

    cy.intercept('GET', '/api/image-posts*', {
      statusCode: 200,
      body: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 1000
      }
    }).as('getPosts');

    cy.intercept('GET', '/user/*', {
      statusCode: 200,
      body: user
    }).as('getUser');

    cy.intercept('POST', '/api/image-posts').as('createPost');

    cy.visit('/gallery/my-posts', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(user));
      }
    });

    cy.wait(['@getPosts', '@getUser']);

    cy.get('button.MuiFab-root').click();
    cy.get('input[placeholder="https://example.com/bild.jpg"]').type('not-a-url');
    cy.contains('Speichern').click();

    cy.get('.MuiFormHelperText-root').contains('URL').should('be.visible');
    cy.get('@createPost.all').should('have.length', 0);
  });
});
