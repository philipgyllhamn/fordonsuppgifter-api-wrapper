# Transportstyrelsen Fordonsuppgifter NodeJS API Wrapper
NodeJS API wrapper/scraper for swedish Transportstyrelsen's service "Fordonsuppgifter" (Vehicle Details). 

## About
This code web scrapes transportstyrelsen service "Fordonsuppgifter" which retrieves vehicle details about specified vehicle based on registration plate, and returns it as a object. The model property names are entirely based on the names on the original Fordonsuppgifter website, with removed 'åöa' characters and is using pascal case.

### Disclaimer
Not ready for production, needs error handling implemented.

## Installation
```
npm i fordonsuppgifter-api-wrapper
```

## Usage
```

const api2 = require("fordonsuppgifter-api-wrapper");

(async () => {
    console.log("fetching vehicle info");
    var res = await api2.GetVehicleInformation("JWZ148");

    console.log(res);
})();
```

```
import * as api from "fordonsuppgifter-api-wrapper";

(async () => {
    console.log("fetching vehicle info");
    var res = await api.GetVehicleInformation("JWZ148");

    console.log(res);
})();

```


## English version usage

There is also a static parser that parses and sets the model names to english, this version will work most times, but not always. Since its static and the main version is mapping dynamically.

```
var res = await api2.GetVehicleInformationEnglish("JWZ148");
```

