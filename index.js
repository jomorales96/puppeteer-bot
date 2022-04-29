const config = require('./config.json');
const puppeteer = require('puppeteer');
const login = require('./login-module');
const simulator = require('./simulator');
const inquirer = require("inquirer");

async function InitPuppeteerApp(itemType) {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    const pageLink = config.host + "/sitecore/shell/Applications/Content%20Editor.aspx?sc_bw=1";
    await page.goto(pageLink);
    await page.setViewport({
        width: 1200,
        height: 800
    });

    await login.login(page);
    
    await simulator.run(page, itemType);

    await login.logout(page);
    await browser.close();
};


const choices = config.item_types.filter(x => x.showInMenu).map(x => x.key );
choices.push("exit");

inquirer
    .prompt([
    {
        type: "list",
        name: "item_type",
        message: "Select item type you want to test",
        choices: choices
    }])
    .then((answer) => {
        if (answer.item_type != "exit")
            InitPuppeteerApp(answer.item_type);
    });
