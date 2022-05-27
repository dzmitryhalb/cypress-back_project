const { not } = require("@angular/compiler/src/output/output_ast")
const { get } = require("core-js/core/dict")
const { createYield } = require("typescript")


describe('Test with backend', () => {

    beforeEach('login to the app', () => {
        cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'} )
        cy.loginToApplication()
    })

    it('verify correct request and response', () => {
 
        cy.intercept('POST', '**/api.realworld.io/api/articles').as('postArticles')

        // cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains(' New Article ').click()
        cy.get('[formcontrolname="title"]').type('This is a title')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the Article')
        cy.contains('Publish Article ').click()

        cy.wait('@postArticles')
        // console.log('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the Article')
            expect(xhr.response.body.article.description).to.equal('This is a description')
        })
    })

    it('intercepting and modifying the request and response', () => {
 
        // cy.intercept('POST', '**/api.realworld.io/api/articles', (req) => {
        //     req.body.article.description = "This is a description 2"
        // }).as('postArticles')

        cy.intercept('POST', '**/api.realworld.io/api/articles', (req) => {
            req.reply( res => {
                expect(res.body.article.description).to.equal("This is a description")
                res.body.article.description = 'This is a description 2'
            })
        }).as('postArticles')

        // cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains(' New Article ').click()
        cy.get('[formcontrolname="title"]').type('This is a title')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the Article')
        cy.contains('Publish Article ').click()

        cy.wait('@postArticles')
        // console.log('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the Article')
            expect(xhr.response.body.article.description).to.equal('This is a description 2')
        })
    })

    it( 'should gave tags with routing object', () => {
        cy.get('.tag-list').should('contain', 'çypress')
        
        .and('contain', 'automation')
        .and('contain', 'testing')
    })

    it('verify global feed likes count', () => {
        cy.intercept('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.intercept('GET', '**/articles*', {fixture: 'articles.json'})

        cy.contains('Global Feed').click()
        // cy.contains(' Your Feed ').click()
        cy.get('app-article-list button').then( listOfbuttons => {
            expeсt(listOfbuttons[0]).to.contain('1')
            expeсt(listOfbuttons[1]).to.contain('5')
        })

        cy.fixture('articles').then( file => {
            const articLink = file.articles[1].slug
            cy.intercept('POST', '**/articles/' + articLink + '/favourite', file)
        })

        cy.get('app-article-list button')
        .eq(1)
        .click()
        .should('contain', '6')

    })

    it.only('delete a new article in a global feed', () => {

        const userCredentials = {
            "user": {
                "email": "dzmitry.ha@abiatec.com",
                "password": "Qwerty12"
            }
        }

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "Request from API",
                "description": "API testing is easy",
                "body": "Angular is cool"
            }
        }
        
        cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials)
        .its('body').then(body => {
            const token = body.user.token

            cy.request({
                url: 'https://api.realworld.io/api/articles/',
                headers: { 'Authorization': 'Token ' + token},
                method: 'POST',
                body: bodyRequest
            }).then( response => {
                expect(response.status).to.equal(200)
            })

           cy.contains('Global Feed').click()
           cy.get('.article-preview').first().click()
           cy.get('.article-actions').contains('Delete Article').click()
           
           cy.request({
               url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
               headers: { 'Authorization': 'Token ' + token},
               method: 'GET'
           }).its('body').then( body => {
               console.log(body)
               expect(body.articles[0].title).not.to.equal("Request from API")
           })

        })
    })
})