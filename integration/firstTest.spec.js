const { createYield } = require("typescript")


describe('Test with backend', () => {

    beforeEach('login to the app', () => {
        cy.server()
        cy.route('GET', '**/tags', 'fixture:tags.json' )
        cy.loginToApplication()
    })

    it.skip('verify correct request and response', () => {

        cy.server() 
        cy.route('POST', '**/articles').as('postArticles')

        // cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains(' New Article ').click()
        cy.get('[formcontrolname="title"]').type('This is a title')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the Article')
        cy.contains('Publish Article ').click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.status).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the Article')
            expect(xhr.response.body.article.description).to.equal('This is a description')
        })
    })

    it( 'should gave tags with routing object', () => {
        cy.get('.tag-list')
        .should('contain', 'çypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
    })

    it('verify global feed likes count', () => {
        cy.route('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.route('GET', '**/articles*', 'fixture:articles.json')

        cy.contains('Global Feed').click()
        // cy.contains(' Your Feed ').click()
        cy.get('app-article-list button').then( listOfbuttons => {
            expeсt(listOfbuttons[0]).to.contain('1')
            expeсt(listOfbuttons[1]).to.contain('5')
        })

        cy.fixture('articles').then( file => {
            const articLink = file.articles[1].slug
            cy.route('POST', '**/articles/' + articLink + '/favourite', file)
        })

        cy.get('app-article-list button')
        .eq(1)
        .click()
        .should('contain', '6')

    })
})