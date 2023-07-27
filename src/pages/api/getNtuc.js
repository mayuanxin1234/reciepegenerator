const puppeteer = require("puppeteer-extra")
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { Cluster } = require('puppeteer-cluster');

puppeteer.use(StealthPlugin())

const url = 'https://www.fairprice.com.sg/'
export default async function getNtuc (req, res) {
    try {
    //const browser = await puppeteer.launch({headless: false})
    //const page = await browser.newPage()
    //await page.goto(url)

    const shoppingList = req.body.shoppingList

    var result = []

    var resultCounter = 0

    console.log(shoppingList)

    //var promises = []

    //var currPromisesCounter = 0
    

    await (async () => { 
        const cluster = await Cluster.launch({
          concurrency: Cluster.CONCURRENCY_CONTEXT,
          maxConcurrency: 8,
        });
    await cluster.task(async ({ page, data: url }) => {
            await page.goto(url);
            var resultOfData = await page.evaluate(() => {
                const firstItem = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")
        
                const data = []
                //image
                data[0] = firstItem?.querySelector(".sc-1plwklf-4.bwtTXZ span img").getAttribute("src")
                //link
                data[1] = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")?.querySelector("a").getAttribute("href")
                //Title
                data[2] = firstItem?.querySelector(".sc-1bsd7ul-1.eKBQTR").textContent
                //Price
                data[3] = firstItem?.querySelector(".sc-1bsd7ul-1.sc-1svix5t-1.cyZSLh.ilXfia").textContent
        
                return data
        
            })
            result[resultCounter] = resultOfData
            resultCounter++
        });

    for (let i = 0; i < shoppingList.length; i++) {

        var urlShoppingList = 'https://www.fairprice.com.sg/search?query=' 

        var curr = shoppingList[i]

        for (let j = 0; j < curr.length; j++) {
            var currChar = curr.charAt(j)
            if (currChar == ' ') {
                urlShoppingList += '%20'
            } else if (currChar == '(') {
                break                
            } else {
                urlShoppingList += currChar
            }
        }

        console.log(urlShoppingList)
        
        cluster.queue(urlShoppingList);

        //await page.goto(urlShoppingList)

        /*
        promises[currPromisesCounter] = new Promise((resolve, reject) => {
            var currPage;
            (async () => { currPage = await browser.newPage()})();
            (async () => { await currPage.goto(urlShoppingList) })();
            (async () => { await currPage.evaluate(() => {
                const firstItem = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")
        
                const data = []
                //image
                data[0] = firstItem?.querySelector(".sc-1plwklf-4.bwtTXZ span img").getAttribute("src")
                //link
                data[1] = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")?.querySelector("a").getAttribute("href")
                //Title
                data[2] = firstItem?.querySelector(".sc-1bsd7ul-1.eKBQTR").textContent
                //Price
                data[3] = firstItem?.querySelector(".sc-1bsd7ul-1.sc-1svix5t-1.cyZSLh.ilXfia").textContent
        
                return data
        
            })
          });
            console.log("inpromise")})()
            */



        /*
        promises[currPromisesCounter] = browser.newPage().goto(urlShoppingList).evaluate(() => {
            const firstItem = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")
    
            const data = []
            //image
            data[0] = firstItem?.querySelector(".sc-1plwklf-4.bwtTXZ span img").getAttribute("src")
            //link
            data[1] = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")?.querySelector("a").getAttribute("href")
            //Title
            data[2] = firstItem?.querySelector(".sc-1bsd7ul-1.eKBQTR").textContent
            //Price
            data[3] = firstItem?.querySelector(".sc-1bsd7ul-1.sc-1svix5t-1.cyZSLh.ilXfia").textContent
    
            return data
    
        })
        */
        //currPromisesCounter++
    /*    
    var itemData = await page.evaluate(() => {
        const firstItem = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")

        const data = []
        //image
        data[0] = firstItem?.querySelector(".sc-1plwklf-4.bwtTXZ span img").getAttribute("src")
        //link
        data[1] = document.querySelector(".sc-1plwklf-0.jJrMPd.product-container.has_ppp")?.querySelector("a").getAttribute("href")
        //Title
        data[2] = firstItem?.querySelector(".sc-1bsd7ul-1.eKBQTR").textContent
        //Price
        data[3] = firstItem?.querySelector(".sc-1bsd7ul-1.sc-1svix5t-1.cyZSLh.ilXfia").textContent

        return data

    })
    result[i] = itemData
    */
    }
    await cluster.idle();
    await cluster.close();
})()

    /*
    await cluster.execute().then((data) => {
        console.log(data)
        result[resultCounter] = data;
        resultCounter++;
    })
    */


    //await browser.close() 
    
    console.log(JSON.stringify(result))

    res.status(200).json({result: JSON.stringify(result)})

    console.log("hi")
} catch (err) {
    res.status(500).send({ error: 'failed to fetch data' })
}

}
