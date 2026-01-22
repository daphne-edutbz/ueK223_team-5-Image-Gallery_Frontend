const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('User delete post', () => {
  it('removes a post after confirmation', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Normal',
      lastName: 'User',
      roles: []
    };

    const post = {
      id: 'post-1',
      imageUrl: 'https://example.com/old.jpg',
      description: 'Post zum Loeschen',
      authorId: 'user-1',
      createdAt: '2024-01-20T10:00:00.000Z'
    };

    let posts = [post];

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

    cy.intercept('DELETE', '/api/image-posts/post-1', (req) => {
      posts = [];
      req.reply({ statusCode: 204 });
    }).as('deletePost');

    cy.visit('/gallery/my-posts', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(user));
      }
    });

    cy.wait(['@getPosts', '@getUser']);

    cy.get('button').filter(':has(svg[data-testid="DeleteIcon"])').first().click();
    cy.contains('button', /L.schen/).click();

    cy.wait('@deletePost');
    cy.wait('@getPosts');

    cy.contains('Post erfolgreich').should('be.visible');
    cy.contains('Du hast noch keine Posts').should('be.visible');
  });
});
