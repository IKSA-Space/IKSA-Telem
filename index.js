/* Main Ground Facilities script*/
// @ts-check
console.log("IKSA Telem Hub")

import KRPC from './node_modules/krpc.js/lib/KRPC.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

//KRPC

const options = {
    name: 'Ground',    // (default)
    host: '144.138.103.239',  // (default)
    rpcPort: 49990,     // (default)
    streamPort: 49991,  // (default)
};

const krpc = new KRPC(options);

const vehicle = {

}

const gameData = {

}

const telem = {

}

async function init(){
    try{
    await krpc.load();
    }catch(err){
        console.error("Error, couldn't connect to KSP")
        fs.writeFileSync(`${__dirname}/errorLog.log`, err.toString())
        console.error(`A log of this error has been saved at ${__dirname}/errorLog.log`)
        return;
    }
    console.log("Connected to KSP")
    gameData.sc = krpc.services.spaceCenter;
    gameData.vessel = await gameData.sc.activeVessel;
    vehicle.object = gameData.vessel;
    gameData.control = await gameData.vessel.control;
}
init()

//Express
let auth = "IKSA_AUTH_rg7euhgahiuo"
const expressApp = express();
expressApp.get("/telem", (req,res) =>{
    if(req.query){
        if(req.query.auth == auth){
            res.status(200).send(JSON.stringify(telem, null, 2))
        }else{
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(401);
    }
})
expressApp.listen(3001, ()=>{
    console.log("IKSA Telemetry Hub listening on 30001");
});