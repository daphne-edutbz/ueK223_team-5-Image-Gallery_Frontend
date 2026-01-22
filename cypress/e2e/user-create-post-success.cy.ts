const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('User create post', () => {
  it('creates a post successfully from My Posts', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Normal',
      lastName: 'User',
      roles: []
    };

    let posts: Array<{ id: string; imageUrl: string; description: string; authorId: string; createdAt: string }> = [];

    cy.intercept('GET', '/api/image-posts*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          content: posts,
          totalElements: posts.length,
          totalPages: 1,
          number: 0,
          size: 1000
        }
      });
    }).as('getPosts');

    cy.intercept('GET', '/user/*', {
      statusCode: 200,
      body: user
    }).as('getUser');

    cy.intercept('POST', '/api/image-posts', (req) => {
      const created = {
        id: 'post-1',
        imageUrl: 'https://example.com/new.jpg',
        description: 'Neuer Post',
        authorId: 'user-1',
        createdAt: '2024-01-20T10:00:00.000Z'
      };
      posts = [created];
      req.reply({ statusCode: 201, body: created });
    }).as('createPost');

    cy.visit('/gallery/my-posts', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(user));
      }
    });

    cy.wait(['@getPosts', '@getUser']);

    cy.get('button.MuiFab-root').click();
    cy.get('input[placeholder="https://example.com/bild.jpg"]').type(
      'https://example.com/new.jpg'
    );
    cy.get('textarea[placeholder="Beschreibe dein Bild..."]').type('Neuer Post');
    cy.contains('Speichern').click();

    cy.wait('@createPost');
    cy.wait('@getPosts');

    cy.contains('Post erfolgreich').should('be.visible');
    cy.get('img[alt="Neuer Post"]').should('be.visible');
  });
});
