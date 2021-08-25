/* Main Ground Facilities script */
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

const vehicleStore = {
    objects: {
        refFlights: {

        },
        refFrames: {
        },

    },
    telem: {
        alt: 0,
        VSPD: 0,
        SSPD: 0,
        OSPD: 0,
        THRO: 1,
        APO: 0,
        TTA: 0,
        PER: 0,
        TTP: 0,
        INC: 0,
        CONT: {
            RCS: false,
            SAS: false
        },
        fuel: {
            BACC: 0,
            S1: {
                Fuel: 0,
                Ox: 0
            },
            S2: {
                Fuel: 0,
                Ox: 0
            },
            MONO: 0,
            ELEC: 0
        },
        REM3T: 0,
        KR1T: 0,
        attitude: {
            PIT: 0,
            ROL: 0,
            YAW: 0
        },
        LOC: {
            LAT: 0,
            LON: 0,
        },
        COMM: {
            name: "",
            delay: ""
        }
    }
}

const KRPCInit = async () =>{ 
    const options = {
      name: 'IKSA-Telem-Hub',
      host: "144.138.103.239",
      rpcPort: 49990,
      streamPort: 49991
    };
    vehicleStore.objects.client = new KRPC(options)
    let timeout = true
    try{
        vehicleStore.objects.client.load().then(async ()=>{
        timeout = false
        })
    }catch(err){
        console.error("ERROR!")
        console.debug("A record of this error has been saved at " + __dirname + "/errorLog.log")
        fs.writeFileSync(__dirname + "/errorLog.log", err)
    }
    setTimeout(async function(){
      if(timeout) {
        console.error("Unable to connect")
      }else{
        vehicleStore.objects.sc = await vehicleStore.objects.client.services.spaceCenter;
        vehicleStore.objects.vessel = await vehicleStore.objects.sc.activeVessel;
        vehicleStore.objects.control = await vehicleStore.objects.vessel.control
        vehicleStore.objects.refFrames.orbit = await vehicleStore.objects.vessel.orbit
        vehicleStore.objects.refFrames.surface = await vehicleStore.objects.vessel.surfaceReferenceFrame
        vehicleStore.objects.refFlights.surface = await vehicleStore.objects.vessel.flight(vehicleStore.objects.refFrames.surface)
        //vehicleStore.objects.comms = await (await vehicleStore.objects.client.services.remoteTech).comms(vehicleStore.objects.vessel);
        setInterval(telemGetter, 500);
        console.log("STARTED TELEM")
      }
    }, 10000);
}

const getPartThrust = async function (tag) {
    return new Promise(resolve => {
        vehicleStore.objects.vessel.parts.then(parts => {
            parts.withTag(tag).then(part => {
                if (part.length == 1) {
                    part[0].engine.then(async (engineMod) => {
                        resolve(await engineMod.thrust);
                    })
                } else {
                    resolve(-1)
                }
            })
        })
    })
}

const getPartFuel = async function (tag, resource) {
    return new Promise(resolve => {
        vehicleStore.objects.vessel.parts.then(parts => {
            parts.withTag(tag).then(part => {
                if (part.length == 1) {
                    part[0].resources.then(async resourcesMod => {
                        const amount = await resourcesMod.amount(resource);
                        const max = await resourcesMod.max(resource)
                        resolve([amount, max]);
                    })
                } else {
                    resolve(-1);
                }
            })
        })
    })
}

const getElec = async function () {
    return new Promise(resolve => {
        vehicleStore.objects.vessel.resources.then(async resources => {
            const amount = await resources.amount("ElectricCharge")
            const max = await resources.max("ElectricCharge")
            resolve([amount, max])
        })
    })
}

const getComms = async function () {
    return new Promise(async resolve => {
        let names = [];
        let name = "";
        let delay = 0;
        const antennas = await vehicleStore.objects.comms.antennas;
        /*antennas.forEach(async antenna =>{
            if(await antenna.hasConnection ){
                if(names.includes(await antenna.targetGroundStation) == false){
                    names.push(await antenna.targetGroundStation)
                    console.log(names)
                }else{
                    console.log(2)
                }
            }
        })*/

        console.log(antennas);
        console.log((await vehicleStore.objects.comms.signalDelay).toFixed(5))
        resolve({
            name: "look, I tried ok",
            delay: (await vehicleStore.objects.comms.signalDelay).toFixed(5)
        })
    })
}

const telemGetter = async () => {
    vehicleStore.objects.refFlights.surface.verticalSpeed.then(value => vehicleStore.telem.VSPD = value);
    vehicleStore.objects.refFlights.surface.meanAltitude.then(value => vehicleStore.telem.alt = value);
    vehicleStore.objects.refFlights.surface.trueAirSpeed.then(value => vehicleStore.telem.SSPD = value);
    vehicleStore.objects.refFrames.orbit.speed.then(value => vehicleStore.telem.OSPD = value);
    vehicleStore.objects.control.throttle.then(value => vehicleStore.telem.THRO = value * 100);
    vehicleStore.objects.refFrames.orbit.apoapsisAltitude.then(value => vehicleStore.telem.APO = value);
    vehicleStore.objects.refFrames.orbit.timeToApoapsis.then(value => vehicleStore.telem.TTA = value);
    vehicleStore.objects.refFrames.orbit.periapsisAltitude.then(value => vehicleStore.telem.PER = value);
    vehicleStore.objects.refFrames.orbit.timeToPeriapsis.then(value => vehicleStore.telem.TTP = value);
    vehicleStore.objects.refFrames.orbit.inclination.then(value => vehicleStore.telem.INC = value);
    vehicleStore.objects.refFlights.surface.pitch.then(value => vehicleStore.telem.attitude.PIT = value);
    vehicleStore.objects.control.sas.then(value => vehicleStore.telem.CONT.SAS = value);
    vehicleStore.objects.control.rcs.then(value => vehicleStore.telem.CONT.RCS = value);
    vehicleStore.objects.refFlights.surface.heading.then(value => vehicleStore.telem.attitude.YAW = value);
    vehicleStore.objects.refFlights.surface.roll.then(value => vehicleStore.telem.attitude.ROL = value);
    vehicleStore.objects.refFlights.surface.longitude.then(value => vehicleStore.telem.LOC.LON = value);
    vehicleStore.objects.refFlights.surface.latitude.then(value => vehicleStore.telem.LOC.LAT = value);
    vehicleStore.objects.vessel.met.then(value => vehicleStore.telem.met=value)
    //Fuel
    //BACC
    getPartFuel("BACC-1", "SolidFuel").then(value => {
        vehicleStore.telem.fuel.BACC = value
    })
    //S1
    //fuel
    getPartFuel("S1-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.S1.Fuel = value
    })
    //Ox
    getPartFuel("S1-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.S1.Ox = value
    })
    //S2
    //fuel
    getPartFuel("S2-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.S2.Fuel = value
    })
    //Ox
    getPartFuel("S2-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.S2.Ox = value
    })
    //Mono
    getPartFuel("S2-M1", "MonoPropellant").then(value => {
        vehicleStore.telem.fuel.MONO = value
    })
    //Elec
    getElec().then(value => {
        vehicleStore.telem.fuel.ELEC = value
    })
    getPartThrust("KR-1").then(value => {
        vehicleStore.telem.KR1T = value
    })
    getPartThrust("RE-M3").then(value => {
        vehicleStore.telem.REM3T = value
    })
    /*getComms().then(value =>{
        vehicleStore.telem.COMM.name = value.name;
        vehicleStore.telem.COMM.delay = value.delay;
    })*/
}
KRPCInit()


const app = express();

app.get("/vehicle", function(req,res){
    res.send(JSON.stringify(vehicleStore.telem));
})

//Express
let auth = "IKSA_AUTH_rg7euhgahiuo"
const expressApp = express();
expressApp.get("/telem", (req,res) =>{
    if(req.query){
        if(req.query.auth == auth){
            res.status(200).send(JSON.stringify(vehicleStore.telem, null, 2))
        }else{
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(401);
    }
})
expressApp.listen(3001, ()=>{
    console.log("IKSA Telemetry Hub listening on 3001");
});