import { test as setup } from '@playwright/test';
import user from '../.auth/userAuth.json'
import fs from 'fs'

const authFile= '.auth/userAuth.json'

setup('save auth token to a file',async ({page,request})=>{

const loginResponse = await request.post(
   `${process.env.LOGIN_URL}`,
   {
     data: {
       user: {
         email: `${process.env.USER_EMAIL}`,
         password: `${process.env.PASSWORD}`
       }
     }
   }
 );
 const loginResponsebody = await loginResponse.json();
 const accessToken = loginResponsebody.user.token;

user.origins[0].localStorage[0].value=accessToken // Save the access token to the user object that will be stored in the file. This step is needed to ensure that the token is available for all tests that will use this file as storage state.
fs.writeFileSync(authFile,JSON.stringify(user)) //Save the user object with the access token to a file. This file will be used as storage state in tests that require authentication.

// declare ENV variable with access Token
process.env['ACCESS_TOKEN']=accessToken // Declare an environment variable with the access token. This step is needed to ensure that the token is available for all tests that will use this environment variable in the headers of API requests.



});