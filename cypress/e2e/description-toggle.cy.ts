const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Gallery description toggle', () => {
  it('shows expand/collapse for long descriptions only', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      roles: []
    };
    const longDescription =
      'Dies ist eine sehr lange Beschreibung fuer einen Test-Post, damit der Button erscheint.';
    const posts = [
      {
        id: 'post-1',
        imageUrl: 'https://example.com/forest.jpg',
        description: longDescription,
        authorId: 'user-1',
        createdAt: '2024-01-15T12:00:00.000Z'
      },
      {
        id: 'post-2',
        imageUrl: 'https://example.com/sea.jpg',
        description: 'Kurzbeschreibung',
        authorId: 'user-1',
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

    cy.get(`img[alt="${longDescription}"]`)
      .should('be.visible')
      .parents('.MuiCard-root')
      .first()
      .as('longCard');

    cy.get('@longCard')
      .find('.MuiCardContent-root')
      .contains(longDescription)
      .should('not.exist');
    cy.get('@longCard')
      .find('.MuiCardContent-root')
      .contains('Mehr anzeigen')
      .should('be.visible')
      .click();
    cy.get('@longCard')
      .find('.MuiCardContent-root')
      .contains(longDescription)
      .should('be.visible');
    cy.get('@longCard')
      .find('.MuiCardContent-root')
      .contains('Weniger anzeigen')
      .should('be.visible')
      .click();
    cy.get('@longCard')
      .find('.MuiCardContent-root')
      .contains('Weniger anzeigen')
      .should('not.exist');

    cy.get('img[alt="Kurzbeschreibung"]')
      .should('be.visible')
      .parents('.MuiCard-root')
      .first()
      .find('.MuiCardContent-root')
      .contains('Mehr anzeigen')
      .should('not.exist');
  });
});
