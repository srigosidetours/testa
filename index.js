const express = require('express');
const path = require('path')
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const { chromium } = require('playwright');

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api', (req, res) => {
  res.json({"msg": "Hello world"});
});

app.get('/titulares', async (req, res) => {
  try {
    const url = 'https://www.ultimahora.es/sucesos.html';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const titulares = [];

    // Busca los h2 y h3
    $('h2, h3').each((i, elem) => {
      const texto = $(elem).text().trim();
      if (texto.length > 0) {
        titulares.push(texto);
      }
    });

    // Muestra en consola para depuración
    console.log('Titulares encontrados:', titulares);

    res.json({ titulares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener titulares' });
  }
});

app.get('/titulares-puppeteer', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.ultimahora.es', { waitUntil: 'networkidle2' });

    // Extrae los titulares (puedes ajustar el selector según lo que quieras)
    const titulares = await page.evaluate(() => {
      // Ejemplo: todos los textos de h2 y h3 (ajustar según necesites)
      const elements = Array.from(document.querySelectorAll('h2, h3'));
      return elements.map(el => el.textContent.trim()).filter(text => text.length > 0);
    });

    res.json({ titulares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener titulares con puppeteer' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get('/titulares-playwright', async (req, res) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true }); // Navegador headless
    const page = await browser.newPage();
    await page.goto('https://www.ultimahora.es/sucesos.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Cambia el selector si lo deseas (ejemplo: todos los <h2> y <h3>)
    const titulares = await page.evaluate(() => {
      const h2h3 = Array.from(document.querySelectorAll('h2, h3'));
      return h2h3.map(el => el.textContent.trim()).filter(Boolean);
    });

    res.json({ titulares });
  } catch (error) {
    console.error('Error Playwright:', error);
    res.status(500).json({ error: 'Error al obtener titulares con playwright' });
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/titulares-puppeteer', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.ultimahora.es', { waitUntil: 'networkidle2' });

    // Extrae los titulares (puedes ajustar el selector según lo que quieras)
    const titulares = await page.evaluate(() => {
      // Ejemplo: todos los textos de h2 y h3 (ajustar según necesites)
      const elements = Array.from(document.querySelectorAll('h2, h3'));
      return elements.map(el => el.textContent.trim()).filter(text => text.length > 0);
    });

    res.json({ titulares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener titulares con puppeteer' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})