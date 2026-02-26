import fs from "fs";
const authFile= '.auth/userAuth.json'

export function GetAccessToken():string{
 // Read file with saved state content and parse it as JSON
 const authState = JSON.parse(fs.readFileSync(authFile, "utf-8"));
 // Extract token
 const accessToken = authState.origins[0].localStorage.find(
   (item:any) => item.name === "jwtToken"
 )?.value;

 if (!accessToken) {
    throw new Error ('Token not found')
 }
 return accessToken;
}
