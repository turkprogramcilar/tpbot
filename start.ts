


// check if we need to load legacy codebase
if (process.env.DCBOT_JSON !== undefined)
    setTimeout(()=>require("./legacy/main.js"),0);

console.log("OK");