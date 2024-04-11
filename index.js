const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const path = require('path');
const fs = require('fs'); 
const port = 3000;

app.get('/servers/pdf/gerar-pdf/:nome', async (req, res) => {
    console.log("caiu aqui");
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    var nome = req.params.nome.split('.')[0];

    await page.goto('#' + nome + '.html', {waitUntil: 'networkidle2'});

    const filePath = path.join('pdfs', nome + '.pdf');

    await page.pdf({path: filePath, format: 'A4'});

    await browser.close();

    res.send("1x1");
});

app.get('/servers/pdf/download-pdf/:nome', (req, res) => {
    const nome = req.params.nome;
    const pdfPath = path.join(__dirname, 'pdfs', nome);
    
    fs.exists(pdfPath, (exists) => {
        if (exists) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${nome}"`); 
            
            res.sendFile(pdfPath);
        } else {
            res.status(404).send('Não foi possível encontrar o arquivo PDF especificado.');
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
