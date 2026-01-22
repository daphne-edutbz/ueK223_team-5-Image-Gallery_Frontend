const buildToken = (payload: Record<string, unknown>) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('Gallery pagination', () => {
  it('shows a new page of posts when pagination changes', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = buildToken({ sub: 'user-1', exp: nowSeconds + 3600 });
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Normal',
      lastName: 'User',
      roles: []
    };

    const page0Posts = Array.from({ length: 12 }, (_, index) => ({
      id: `post-${index + 1}`,
      imageUrl: `https://example.com/${index + 1}.jpg`,
      description: `Post ${index + 1}`,
      authorId: 'user-1',
      createdAt: `2024-01-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`
    }));

    const page1Posts = [
      {
        id: 'post-13',
        imageUrl: 'https://example.com/13.jpg',
        description: 'Post 13',
        authorId: 'user-1',
        createdAt: '2024-02-01T10:00:00.000Z'
      }
    ];

    cy.intercept('GET', '/api/image-posts*', (req) => {
      const url = new URL(req.url);
      const page = url.searchParams.get('page') || '0';
      const isSecondPage = page === '1';
      const pagePosts = isSecondPage ? page1Posts : page0Posts;

      req.reply({
        statusCode: 200,
        body: {
          content: pagePosts,
          totalElements: 13,
          totalPages: 2,
          number: Number(page),
          size: 12
        }
      });
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

    cy.get('img[alt="Post 1"]').should('be.visible');
    cy.get('button[aria-label="Go to page 2"]').click();

    cy.wait('@getPosts');

    cy.get('img[alt="Post 13"]').should('be.visible');
    cy.get('img[alt="Post 1"]').should('not.exist');
  });
});
