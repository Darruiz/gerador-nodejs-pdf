const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const port = 3000;

let browser;

async function startBrowser() {
    if (browser) {
        console.log("Fechando o navegador existente.");
        await browser.close();
    }  
    console.log("Lançando novo navegador.");
    browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
        ],
        headless: true,
        timeout: 0
    });
}

app.use((req, res, next) => {
    const dir = path.join(__dirname, 'pdfs');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    next();
});

app.get('/servers/pdf/gerar-pdf/:nome', async (req, res) => {
    console.log("Generating PDF for:", req.params.nome);
    if (!browser) {
        await startBrowser();
    }

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0); 
    await page.setDefaultTimeout(0); 

    const nome = req.params.nome.split('.')[0];
    const url = `https://jvaz.leap.dev.br/_pdf/${nome}.html`;

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        const filePath = path.join(__dirname, 'pdfs', `${nome}.pdf`);
        await page.pdf({ path: filePath, format: 'A4' });
        await page.close();
        res.send("PDF gerado com sucesso.");
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
        await page.close();
        if (!browser.isConnected()) {
            await startBrowser();
        }
        res.status(500).send('Erro ao gerar o PDF');
    }
});

app.get('/servers/pdf/download-pdf/:nome', (req, res) => {
    const nome = req.params.nome;
    const pdfPath = path.join(__dirname, 'pdfs', nome);
    
    fs.exists(pdfPath, exists => {
        if (exists) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nome}"`);
            res.sendFile(pdfPath);
        } else {
            res.status(404).send('Arquivo PDF não encontrado.');
        }
    });	
});

cron.schedule('0 0 3 * * *', () => {
    console.log('Executando tarefa para excluir todos os arquivos PDF à meia-noite, horário de Brasília.');
    const directory = path.join(__dirname, 'pdfs');

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            if (file.endsWith('.pdf')) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        }
    });
}, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
