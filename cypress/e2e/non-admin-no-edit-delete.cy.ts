const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Non-admin restrictions on gallery', () => {
  it('does not show edit or delete actions for other users posts', () => {
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
        content: [
          {
            id: 'post-1',
            imageUrl: 'https://example.com/other.jpg',
            description: 'Post von jemand anderem',
            authorId: 'user-2',
            createdAt: '2024-01-20T10:00:00.000Z'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 12
      }
    }).as('getPosts');

    cy.intercept('GET', '/user', {
      statusCode: 200,
      body: [
        user,
        {
          id: 'user-2',
          email: 'other@example.com',
          firstName: 'Other',
          lastName: 'User',
          roles: []
        }
      ]
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

    cy.get('svg[data-testid="EditIcon"]').should('not.exist');
    cy.get('svg[data-testid="DeleteIcon"]').should('not.exist');
  });
});
