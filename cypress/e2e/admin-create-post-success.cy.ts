const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Admin create post', () => {
  it('creates a post successfully', () => {
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

    cy.intercept('POST', '/api/image-posts', {
      statusCode: 201,
      body: {
        id: 'post-1',
        imageUrl: 'https://example.com/new.jpg',
        description: 'Neuer Post',
        authorId: 'admin-1',
        createdAt: '2024-01-20T10:00:00.000Z'
      }
    }).as('createPost');

    cy.visit('/gallery', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(adminUser));
      }
    });

    cy.wait(['@getPosts', '@getUsers', '@getUser']);

    cy.get('button.MuiFab-root').click();
    cy.get('input[placeholder="https://example.com/bild.jpg"]').type(
      'https://example.com/new.jpg'
    );
    cy.get('textarea[placeholder="Beschreibe das Bild..."]').type('Neuer Post');
    cy.contains('Speichern').click();

    cy.wait('@createPost');
    cy.contains('Post erfolgreich erstellt').should('be.visible');
  });
});
