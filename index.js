const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.get('/gerar-pdf/', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

   //var id= req.params.id;   :id:nome:link
   //var nome= req.params.nome; 
   //var link = req.params.link; 

    

    await page.goto('http://localhost/jvaz/htmls-teste/ger.html', {waitUntil: 'networkidle2'});

    const path = 'teste.pdf'; 

    await page.pdf({path: path, format: 'A4'});

    await browser.close();

    res.send("PDF gerado com sucesso. Salvo em: " + path);
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
