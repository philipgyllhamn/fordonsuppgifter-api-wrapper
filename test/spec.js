const transportAPI = require('../src/index');

(async () => {
    const res = await transportAPI.GetVehicleInformation("ABC123");
    //const res = await transportAPI.GetVehicleInformation("HEJKOLLLLLG");
    //const res = await transportAPI.TestCrawlV2("MTR00B");
    console.log(res);
})();
