# Transportstyrelsen Fordonsuppgifter (Vehicle Details) NodeJS API Wrapper
NodeJS API wrapper/scraper for swedish Transportstyrelsen's service "Fordonsuppgifter" (Vehicle Details). 

## About
This code web scrapes transportstyrelsen service "Fordonsuppgifter" which retrieves vehicle details about specified vehicle based on registration plate, and returns it as a object. The model property names are entirely based on the names on the original Fordonsuppgifter website, with removed 'åöa' characters and is using pascal case.

### Disclaimer
Not ready for production, needs error handling implemented.

## Usage
```
const transportAPI = require('../src/index');

(async () => {
    const res = await transportAPI.GetVehicleInformation("XXX000");
    console.log(res);
})();
```
