const { createYield } = require("typescript")


describe('Test with backend', () => {

    beforeEach('login to the app', () => {
        cy.loginToApplication()
    })

    it('should log in', () => {
        cy.log('Yeeey I logged in!')
    })
})