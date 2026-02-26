import {test,expect,request} from '@playwright/test'
import {GetAccessToken} from '../utils/getAccessToken'
import { faker } from '@faker-js/faker'

test.beforeEach(async ({request})=>{
const requestHeaders= {
Authorization: `Token ${GetAccessToken()}`
}
const createNewArticleRequest = await request.post('https://conduit-api.bondaracademy.com/api/articles/',{
data: {"article":
  {"title":"Test article for Like counter"+" "+`${faker.book.title()}`,
    "description":"Test created article with api"+" "+`${faker.book.publisher()}`, // to make description unique for each created article with timestamp
    "body":"Test article for Like counter"+" "+ `${faker.number.int({min:1000,max:9999})}`,// to make body unique for each created article with faker library
    "tagList":["Demo"]}},
    
headers:requestHeaders
})
expect(createNewArticleRequest.status()).toBe(201)

const createNewArticleResponseBody=await createNewArticleRequest.json()
console.log(createNewArticleResponseBody)
const uniqueArticleID = createNewArticleResponseBody.article.slug
process.env['ARTICLE_ID']=uniqueArticleID
console.log('Created article ID:', process.env['ARTICLE_ID'])

})


test('Check counter', async({page,request})=>{
await page.goto(process.env.URL as string)    
await page.getByText('Global feed').click()

const likeButton = await page.locator('app-article-preview').first().locator('button')
await expect(likeButton).toHaveText('0')
await likeButton.click()
await expect(likeButton).toHaveText('1')
const requestHeaders= {
Authorization: `Token ${GetAccessToken()}`
}
const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.ARTICLE_ID}`,{
  headers:requestHeaders
})

console.log('Response headers:',deleteArticleResponse.headers())
await expect(deleteArticleResponse.status()).toBe(204)
})