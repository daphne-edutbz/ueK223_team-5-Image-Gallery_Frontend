const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Gallery like toggle', () => {
  it('toggles like state for a post', () => {
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
      imageUrl: 'https://example.com/like.jpg',
      description: 'Like Post',
      authorId: 'user-2',
      createdAt: '2024-01-20T10:00:00.000Z'
    };

    cy.intercept('GET', '/api/image-posts*', {
      statusCode: 200,
      body: {
        content: [post],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 12
      }
    }).as('getPosts');

    cy.intercept('GET', '/user', {
      statusCode: 200,
      body: [user, { ...user, id: 'user-2', email: 'other@example.com' }]
    }).as('getUsers');

    cy.intercept('GET', '/user/*', {
      statusCode: 200,
      body: user
    }).as('getUser');

    cy.intercept('POST', '/api/image-posts/post-1/like', {
      statusCode: 200,
      body: post
    }).as('toggleLike');

    cy.visit('/gallery', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', `Bearer ${token}`);
        win.localStorage.setItem('user', JSON.stringify(user));
      }
    });

    cy.wait(['@getPosts', '@getUsers', '@getUser']);

    cy.get('button[aria-label="Like"]').click();
    cy.wait('@toggleLike');
    cy.get('button[aria-label="Like"]').should(
      'have.css',
      'color',
      'rgb(233, 30, 99)'
    );

    cy.get('button[aria-label="Like"]').click();
    cy.wait('@toggleLike');
    cy.get('button[aria-label="Like"]').should(
      'not.have.css',
      'color',
      'rgb(233, 30, 99)'
    );
  });
});
