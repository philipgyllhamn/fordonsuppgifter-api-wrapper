# Transportstyrelsen Fordonsuppgifter NodeJS API Wrapper
NodeJS API wrapper/scraper for swedish Transportstyrelsen's service "Fordonsuppgifter" (Vehicle Details). 

## About
This code web scrapes transportstyrelsen service "Fordonsuppgifter" which retrieves vehicle details about specified vehicle based on registration plate, and returns it as a object. The model property names are entirely based on the names on the original Fordonsuppgifter website, with removed 'åöa' characters and is using pascal case.

### Disclaimer
Not ready for production, needs error handling implemented.

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
    var res = await api2.GetVehicleInformation("JWZ148");

    console.log(res);
})();

```

