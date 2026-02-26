import {expect} from '@playwright/test'
import { test } from '../test.options'
import { faker } from '@faker-js/faker'
import mockResponse from '../tests/test-data/mockResponse.json'
import {GetAccessToken} from '../utils/getAccessToken'



test.beforeEach(async ({page})=>{
await page.goto(process.env.URL as string)

})

test('Check mock api response', async ({ page }) => {
//This mock is used to replace the whole response body
 await page.route("**/api/tags", async mockFunction=>{
    console.log(mockFunction.request().url().toString())
    console.log(mockResponse)
    await mockFunction.fulfill({
      status:200,
      contentType:'application/json',
      body: JSON.stringify(mockResponse)
    })
  })
//This mock is used to replace the part of response body
  await page.route("**/api/articles*", async mockFunction=>{
      const response = await mockFunction.fetch()
       const responseBody = await response.json()
        
        responseBody.articles[0].title="Mocked Article Title"
        responseBody.articles[0].description="Mocked Article Description"

        console.log(responseBody)

        await mockFunction.fulfill({
          status:200,
          contentType:'application/json',
          body: JSON.stringify(responseBody)
        })
    })

  await page.waitForResponse('**/api/tags')//This step is needed to ensure that the mocked response is loaded before assertions. Otherwise, the test may fail because of the original API response being loaded after the assertions are executed.
  await page.waitForResponse('**/api/articles*')//This step is needed to ensure that the mocked response is loaded before assertions. Otherwise, the test may fail because of the original API response being loaded after the assertions are executed.
  // Expect a title "to contain" a substring.
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  // Check that mocked article title is displayed on the page
  await expect(page.locator('.article-preview').first().locator('h1')).toHaveText('Mocked Article Title');
  await expect(page.locator('.article-preview').first().locator('p')).toHaveText('Mocked Article Description');
 
  
})



test.describe('Test API suite for create articlle', () => {
  test.describe.configure({ retries: 1 }) 
  test('test create an article via api call with auth token and delete vi UI button', async ({ page, request,playwright }) => {

const requestHeaders= {
Authorization: `Token ${GetAccessToken()}`
}
const createNewArticleRequest = await request.post('https://conduit-api.bondaracademy.com/api/articles/',{
data: {"article":
  {"title":"Test article for Demo",
    "description":"Test created article with api"+" "+`${Date.now}`, // to make description unique for each created article with timestamp
    "body":"Demo test body"+" "+ `${faker.number.int({min:1000,max:9999})}`,// to make body unique for each created article with faker library
    "tagList":["Demo"]}},
    
headers:requestHeaders
})
console.log('Request headers:', requestHeaders)
console.log('Response headers:',createNewArticleRequest.headers())
const createNewArticleResponseBody=await createNewArticleRequest.json()
console.log(createNewArticleResponseBody)
expect(createNewArticleRequest.status()).toBe(201)

await page.getByText('Global feed').click()
await page.getByText('Test article for Demo').click()
await page.getByRole('button', { name: 'Delete Article' }).first().click()

})

test('test create an article via UI button and delete it via Api call',async ({page,request},testInfo)=>{
if (testInfo.retry) {                                                             //second argument testInfo is used to get information about the current test, including the retry count. If the test is being retried, the retry count will be greater than 0, and you can use this information to conditionally execute code based on whether the test is a retry or not.
  console.log(`Retrying test: ${testInfo.title}, attempt: ${testInfo.retry}`);
} else {
  console.log(`Running test for the first time: ${testInfo.title}`);
} 
await page.getByText('New article').click()
await page.getByPlaceholder('Article title').click()
await page.getByPlaceholder('Article title').fill('Test my new article for API')
await page.getByRole('textbox', { name: 'What\'s this article about?' }).click()
await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('My first article'+" "+ faker.book.genre())
await page.getByRole('textbox', { name: 'Write your article (in' }).click()
await page.getByRole('textbox', { name: 'Write your article (in' }).fill(`Playwright is awsome ${faker.number.int()} ${faker.book.title()}`)
await page.getByRole('button', { name: 'Publish Article' }).click()
// await page.screenshot({path:`screenshots/${testInfo.title}.png`}) // this step is needed to make a screenshot of the created article page before deletion. The screenshot will be saved in the screenshots folder with the name of the test title.
const newArticleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
const newArticleResponseBody = await newArticleResponse.json()
const UniqeId=newArticleResponseBody.article.slug
console.log(UniqeId)
await expect(page.getByText('Test my new article for API')).toBeVisible()

const requestHeaders= {
Authorization: `Token ${GetAccessToken()}`
}

const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${UniqeId}`,{
  headers:requestHeaders
})

console.log('Request headers:', requestHeaders)
console.log('Response headers:',deleteArticleResponse.headers())
await expect(deleteArticleResponse.status()).toBe(204)

await page.reload()

})

});