const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Gallery', () => {
  it('loads and renders posts', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      roles: []
    };
    const posts = [
      {
        id: 'post-1',
        imageUrl: 'https://example.com/lake.jpg',
        description: 'Sunset over lake',
        authorId: 'user-1',
        createdAt: '2024-01-15T12:00:00.000Z'
      },
      {
        id: 'post-2',
        imageUrl: 'https://example.com/mountain.jpg',
        description: 'Mountain ridge',
        authorId: 'user-2',
        createdAt: '2024-01-14T08:30:00.000Z'
      }
    ];

    cy.intercept('GET', '/api/image-posts*', {
      statusCode: 200,
      body: {
        content: posts,
        totalElements: posts.length,
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
          email: 'max@example.com',
          firstName: 'Max',
          lastName: 'Mustermann',
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

    cy.contains('Galerie').should('be.visible');
    cy.get('img[alt="Sunset over lake"]')
      .should('be.visible')
      .parents('.MuiCard-root')
      .first()
      .find('.MuiCardContent-root')
      .contains('Sunset over lake')
      .should('be.visible');
    cy.get('img[alt="Mountain ridge"]')
      .should('be.visible')
      .parents('.MuiCard-root')
      .first()
      .find('.MuiCardContent-root')
      .contains('Mountain ridge')
      .should('be.visible');
  });
});
