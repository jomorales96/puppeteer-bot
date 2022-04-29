async function login(page) {
    await page.waitForSelector("#UserName");
    await page.type("#UserName", "admin");
    
    await page.waitForSelector("#Password");
    await page.type("#Password", "b");
    
    await page.waitForSelector("#LogInBtn");
    await page.click("#LogInBtn");
};

async function logout(page) {
    await page.waitForSelector("span.logout");
    await page.click("span.logout");
};

module.exports = {
    login,
    logout
};