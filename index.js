/* Main Ground Facilities script*/
// @ts-check

import KRPC from './node_modules/krpc.js/lib/KRPC.js';
import express from 'express';

//KRPC

const options = {
    name: 'Ground',    // (default)
    host: '144.138.103.239',  // (default)
    rpcPort: 49990,     // (default)
    streamPort: 49991,  // (default)
};

const krpc = new KRPC(options);

const telem = {

}


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
expressApp.listen(3001);