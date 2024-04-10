const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.get('/gerar-pdf/:nome', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var nome = req.params.nome;

    await page.goto('http://localhost/jvaz/pdfs/' + nome, {waitUntil: 'networkidle2'});

    const path = 'pdfs/' + nome + '.pdf';

    await page.pdf({path: path, format: 'A4'});

    await browser.close();

    res.send("PDF gerado com sucesso. Salvo em: " + path);
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
