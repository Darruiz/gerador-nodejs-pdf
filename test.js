const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost/pupteste-node/texto.html', {waitUntil: 'networkidle2'});
    await page.pdf({path: 'teste.pdf', format: 'A4'});

    await browser.close();
    console.log("PDF gerado com sucesso.");
})();