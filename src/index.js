const cheerio = require('cheerio');
const playwright = require('playwright');
const userAgent = require('user-agents');

const LoadHTMLFromPage = async (regnr) => {

    try {
            let html = "";
        
            await playwright.chromium.launch({headless: true}).then(async (browser) => {
                const context = await browser.newContext({
                    userAgent: userAgent.toString()
                });
                
                const page = await context.newPage()
        
                await page.goto('https://fu-regnr.transportstyrelsen.se/extweb/UppgifterAnnatFordon')
            
                await page.waitForTimeout(500);
            
                await page.fill('#ts-regnr-sok', regnr);
            
                await page.locator('#btnSok').click();
        
                await page.waitForURL('https://fu-regnr.transportstyrelsen.se/extweb/UppgifterAnnatFordon/Fordonsuppgifter');
                
                await page.locator('#expand_button').click();
        
                html = await page.content();
            
                await browser.close();
                
            });
        
            return html;
        
    } catch (error) {
        
        throw "Error loading webpage";

    }
}

const ParseData = (html) => {
    try {
        if(typeof(html) === 'string' ){
            const $ = cheerio.load(html);
        
            $('strong').remove();
            $('br').remove();
        
            return $.text().replace(/\s+|([.,])(?=\S)/g, '$1 ').replace(/^\s|\s$/g, '');
        }else{
            return "undefined"
        }

    } catch (error) {

        throw("Error parsing html");
    }
}

const CrawlHTMLV2 = (html) => {
    try {

        const $ = cheerio.load(html);
        let model = {};
    
        const mainDiv = $("#accordion");
    
        mainDiv.children().each((i ,elem) => {
            // inside panel
            const curr = $(elem);
    
            const titleContent = curr.first();
            let headTitle = $(titleContent).find("span > a").text().replace(/\s+|([.,])(?=\S)/g, '$1 ').replace(/^\s|\s$/g, '');
            headTitle = toPascalCase(headTitle);
            
            model[headTitle] = {};
    
            const content = curr.last(); // get collapse div
    
            content.children().each((j, elm) => {
                // inside collapsediv
                const data = $(elm).find("div > div");
    
                data.children().each((k, elme) => {
                    //inside content div
                    var className = $(elme).attr("class");
                    
                    if(className && className.includes("col-sm-6 col-xs-12")){
                        var para = $(elme).find("p");
    
                        let title = $(para.find("strong")).text().replace(/\s+|([.,])(?=\S)/g, '$1 ').replace(/^\s|\s$/g, '');
                        $(para.find("strong")).remove()
                        $(para.find("br")).remove()
    
                        const value = $(para).text().replace(/\s+|([.,])(?=\S)/g, '$1 ').replace(/^\s|\s$/g, '');
    
                        title = toPascalCase(replaceSpecialCharacters(title))
    
                        model[headTitle][title] = value;
                    }
    
                })
            })
    
        })
    
        return model;

    } catch (error) {

        throw "Error crawling html";
    }
   
}

function toPascalCase(str){
    return `${str}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), s => s.toUpperCase());
}

function replaceSpecialCharacters(str){

    let finalStr = "";

    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        
        switch (char) {
            case 'Ö':
                char = 'O'
                break;
            case 'Ä':
                char = 'A'
                break;
            case 'ö':
                char = 'o'
                break;
            case 'ä':
                char = 'a'
                break;
            case 'å':
                char = 'a'
                break;
            case 'Å':
                char = 'A'
                break;
            default:
                break;
        }

        finalStr += char;
    }

    return finalStr;
}

const CrawlHTML = (html) => {
    try {
        const $ = cheerio.load(html);
    
        const model = {
            Summary:{
                CarMake: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(2) > p').html()),
                CarMakeExtra: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(3) > p').html()),
                Status: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(4) > p').html()),
                Color: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(5) > p').html()),
                ModelYear: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(6) > p').html()),
                ProdYear: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(7) > p').html()),
                Type: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(8) > p').html()),
                LastCheckup: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(9) > p').html()),
                Banned: ParseData($('#ts-sammanfattningCollapse > div > div > div:nth-child(10) > p').html())
            },
            Owner:{
                Acquired: ParseData($('#ts-agareCollapse > div > div.row.ts-row-align > div:nth-child(1) > p').html()),
                AmountOfOwners: ParseData($('#ts-agareCollapse > div > div.row.ts-row-align > div:nth-child(2) > p').html()),
                Name: ParseData($('#ts-agareCollapse > div > div.row.ts-row-align > div:nth-child(3) > p').html()),
                Address: ParseData($('#ts-agareCollapse > div > div.row.ts-row-align > div:nth-child(4) > p').html()),
                Zip: ParseData($('#ts-agareCollapse > div > div.row.ts-row-align > div:nth-child(5) > p').html()),
                City: ParseData($('#ts-agareCollapse > div > div.row.ts-row-align > div:nth-child(6) > p').html()),
                Insurance:{
                    Company: ParseData($('#ts-forsakring-innerCollapse > div > div > div:nth-child(1) > p').html()),
                    Date: ParseData($('#ts-forsakring-innerCollapse > div > div > div:nth-child(2) > p').html())
                }
            },
            Identity:{
                Regnr: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(1) > p').html()),
                CarMake: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(2) > p').html()),
                CarMakeExtra: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(3) > p').html()),
                Color: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(4) > p').html()),
                Type: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(5) > p').html()),
                Category: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(6) > p').html()),
                ModelYear: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(7) > p').html()),
                ProdYear: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(8) > p').html()),
                ChassiID: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(9) > p').html()),
                Approvalnr: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(10) > p').html()),
                ApprovalDate: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(11) > p').html()),
                VariantType: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(12) > p').html()),
                Variant: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(13) > p').html()),
                Version: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(14) > p').html()),
                PlateFormatFront: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(15) > p').html()),
                PlateFormatBack: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(16) > p').html()),
                RegistrationEvidenceP1: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(17) > p').html()),
                RegistrationEvidenceP2: ParseData($('#ts-fordonsidentitetCollapse > div > div > div:nth-child(18) > p').html())
            },
            Status: {
                VehicleStatus: ParseData($('#ts-statusCollapse > div > div > div:nth-child(1) > p').html()),
                RegistratedFirstTime: ParseData($('#ts-statusCollapse > div > div > div:nth-child(2) > p').html()),
                Imported: ParseData($('#ts-statusCollapse > div > div > div:nth-child(3) > p').html()),
            },
            Inspection: {
                InspectionDeadline: ParseData($('#ts-besiktningCollapse > div > div > div:nth-child(1) > p').html()),
                LastApprovedInspection: ParseData($('#ts-besiktningCollapse > div > div > div:nth-child(2) > p').html()),
                MeterReading: ParseData($('#ts-besiktningCollapse > div > div > div:nth-child(3) > p').html()),
                DrivingBan: ParseData($('#ts-besiktningCollapse > div > div > div:nth-child(4) > p').html()),
                BanReason: ParseData($('#ts-besiktningCollapse > div > div > div:nth-child(5) > p').html()),
            },
            TaxesAndFees:{
                TaxDuty: ParseData($('#ts-skattCollapse > div > div > div:nth-child(1) > p').html()),
                YearTax: ParseData($('#ts-skattCollapse > div > div > div:nth-child(2) > p').html()),
                RoadCharge: ParseData($('#ts-skattCollapse > div > div > div:nth-child(3) > p').html()),
                PayMonth: ParseData($('#ts-skattCollapse > div > div > div:nth-child(4) > p').html()),
                UseBan: ParseData($('#ts-skattCollapse > div > div > div:nth-child(5) > p').html()),
                DebitedFee: ParseData($('#ts-skattCollapse > div > div > div:nth-child(6) > p').html()),
                ClaimFee: ParseData($('#ts-skattCollapse > div > div > div:nth-child(7) > p').html()),
                CongestionTaxDuty: ParseData($('#ts-skattCollapse > div > div > div:nth-child(8) > p').html())
            },
            TechnicalData: {
                Body: ParseData($('#ts-karossCollapse > div > div > div > p').html()),
                MeasurmentsAndWeight:{
                    Length: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(1) > p').html()),
                    Width: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(2) > p').html()),
                    Height: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(3) > p').html()),
                    ServiceWeight: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(4) > p').html()),
                    MaxLoadWeight: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(5) > p').html()),
                    TotalWeight: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(6) > p').html()),
                    OriginalTotalWeight: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(7) > p').html()),
                    TaxWeight: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(8) > p').html()),
                    TaxWeightLock: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(9) > p').html()),
                    AllowedLoadWeight: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(10) > p').html()),
                    BackOverhang: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(11) > p').html()),
                    TrunkLength: ParseData($('#ts-MattViktCollapse > div > div > div:nth-child(12) > p').html())
                },
                AxlesAndWheels:{
                    AxleAmount: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(1) > div:nth-child(1) > p').html()),
                    WheelAmount: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(1) > div:nth-child(2) > p').html()),
                    RoadFriendlySuspension: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(1) > div:nth-child(3) > p').html()),
                    AxleOne:{
                        MaxAxleDistanceOneAndTwo: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(4) > div:nth-child(1) > p').html()),
                        TireDimension: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(4) > div:nth-child(2) > p').html()),
                        RimDimension: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(4) > div:nth-child(3) > p').html()),
                        GuaranteedAxlePressure: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(4) > div:nth-child(4) > p').html()),
                        TotalWeightDistribution: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(4) > div:nth-child(5) > p').html()),
                    },
                    AxleTwo:{
                        TireDimension: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(7) > div:nth-child(1) > p').html()),
                        RimDimension: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(7) > div:nth-child(2) > p').html()),
                        GuaranteedAxlePressure: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(7) > div:nth-child(3) > p').html()),
                        TotalWeightDistribution: ParseData($('#ts-HjulOchAxlarCollapse > div > div:nth-child(7) > div:nth-child(4) > p').html()),
                    }
                },
                Brakes:{
                    Equipment: ParseData($('#ts-koppling-innerCollapse > div > div.row > div:nth-child(1) > p').html()),
                    MaxCombinedBruttoWeight: ParseData($('#ts-koppling-innerCollapse > div > div.row > div:nth-child(2) > p').html()),
                },
                MaxPassengers: ParseData($('#ts-PassagerareSakerhetCollapse > div > div > div > p').html()),
                Engine: {
                    Gearbox: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(1) > p').html()),
                    PunchVolume: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(2) > p').html()),
                    EnviromentClass: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(3) > p').html()),
                    Fuel: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(4) > p').html()),
                    TankVolume: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(5) > p').html()),
                    EngineEffect: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(6) > p').html()),
                    EffectNorm: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(7) > p').html()),
                    TopSpeed: ParseData($('#ts-miljoCollapse > div > div > div:nth-child(8) > p').html()),
                }
            }
    
        }
    
        return model;
        
    } catch (error) {

        throw "Error crawling html";
    }

}

const ValidateRegNr = (regnr) => {
    return regnr.match(/[a-zA-ZåäöÅÄÖ\d\s]{2,7}/g).length == 1;
}

exports.TestValidateReg = (regnr) => {
    return ValidateRegNr(regnr)
}

// maps data dynamically to a dynamic model, model/data is not static
// property names are in swedish
exports.GetVehicleInformation = async (regnr) => {
    if(!regnr) return "no registration number attached";
    if(!ValidateRegNr(regnr)) return "not a valid registration number"

    const html = await LoadHTMLFromPage(regnr);
    return CrawlHTMLV2(html);
}

// uses the old version of the crawler
// maps data to a static model with english property names, will not always be correct, use at own risk
exports.GetVehicleInformationEnglish = async (regnr) => {
    if(!regnr) return "no registration number attached";
    if(!ValidateRegNr(regnr)) return "not a valid registration number"

    const html = await LoadHTMLFromPage(regnr);
    return CrawlHTML(html);
}

