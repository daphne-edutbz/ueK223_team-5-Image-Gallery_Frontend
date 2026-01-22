const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('User edit post', () => {
  it('updates an existing post', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Normal',
      lastName: 'User',
      roles: []
    };

    const basePost = {
      id: 'post-1',
      imageUrl: 'https://example.com/old.jpg',
      authorId: 'user-1',
      createdAt: '2024-01-20T10:00:00.000Z'
    };

    let currentDescription = 'Alte Beschreibung';

    cy.intercept('GET', '/api/image-posts*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          content: [{ ...basePost, description: currentDescription }],
          totalElements: 1,
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

    cy.intercept('PUT', '/api/image-posts/post-1', (req) => {
      currentDescription = 'Neue Beschreibung';
      req.reply({ statusCode: 200, body: { ...basePost, description: currentDescription } });
    }).as('updatePost');

    cy.visit('/gallery/my-posts', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(user));
      }
    });

    cy.wait(['@getPosts', '@getUser']);

    cy.get('button').filter(':has(svg[data-testid="EditIcon"])').first().click();
    cy.get('textarea[placeholder="Beschreibe dein Bild..."]')
      .clear()
      .type('Neue Beschreibung');
    cy.contains('Speichern').click();

    cy.wait('@updatePost');
    cy.wait('@getPosts');

    cy.contains('Post erfolgreich').should('be.visible');
    cy.contains('Neue Beschreibung').should('be.visible');
  });
});
