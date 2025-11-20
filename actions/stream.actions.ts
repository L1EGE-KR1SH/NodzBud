// "use server";

// import { currentUser } from "@clerk/nextjs/server";
// import { StreamClient } from "@stream-io/node-sdk";

// const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
// const apiSecret = process.env.STREAM_SECRET_KEY;

// export const tokenProvider = async () => {
//     const user = await currentUser();

//     if(!user) throw new Error('User is not logged in!');
//     if(!apiKey) throw new Error('Apikey not found!');
//     if(!apiSecret) throw new Error('No ApiSecret!');

//     const client = new StreamClient(apiKey , apiSecret)
//     const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
//     const issued = Math.floor(Date.now() / 1000) - 60;
//     const token = client.generateUserToken({user_id : user.id , validity_in_seconds : exp, issued})
//     return token;
// }
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
    const user = await currentUser();

    if (!user) throw new Error("User is not logged in!");
    if (!apiKey) throw new Error("Apikey not found!");
    if (!apiSecret) throw new Error("No ApiSecret!");

    const client = new StreamClient(apiKey, apiSecret);

    const now = Math.floor(Date.now() / 1000);
    const iat = now - 60; 

    const token = client.generateUserToken({
        user_id: user.id,
        iat,                  
        validity_in_seconds: 60 * 60,  
    });

    return token;
};
