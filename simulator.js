
const config = require('./config.json');
const utils = require('./utils');

async function run(page, itemType) {
    goToNewHomesTree(page);
    await page.waitForTimeout(3000);
    let states = await openStatesOrProvincesTrees(page);

    let items = await showItems(page, states, itemType);

    let sample = await getSample(items, itemType);

    await runTest(page, sample);
};

async function goToNewHomesTree(page) {
    const homeItem = await utils.getFirstElementFromPropertyAndValue(page, "div.scContentTreeNode", "textContent", "Home");
    let arrow = await utils.getElementBySelector(homeItem, "img.scContentTreeNodeGlyph");
    await arrow.click();
    
    const newHomesItem = await utils.getFirstElementFromPropertyAndValue(homeItem, "div.scContentTreeNode", "textContent", "New Homes");
    arrow = await utils.getElementBySelector(newHomesItem, "img.scContentTreeNodeGlyph");
    await arrow.click();
}

async function openStatesOrProvincesTrees(page) {
    let stateItemsList = [];

    for(const state of config.states){
        let stateItem = await utils.getFirstElementFromPropertyAndValue(page, "div.scContentTreeNode", "textContent", state);
        stateItemsList.push(stateItem);
        let arrow = await utils.getElementBySelector(stateItem, "img.scContentTreeNodeGlyph");
        await arrow.click();
    }

    return stateItemsList;
}

async function getItemsNodes(page, itemType) {
    const imgSrc = config.item_types.find(x => x.key == itemType).img_src;
    const imgSelector = "img[src= '" + imgSrc + "']";
    const elements = await utils.getElementFromChildrenPropertyValue(page, "div.scContentTreeNode", imgSelector);
    
    return elements;
}

async function showItems(page, states, itemType) {
    let itemTypes = config.item_types.map(x => x.key );
    
    //Removes Plans from array if the items to test are MIR
    if (itemType == "MIR")
        itemTypes = itemTypes.filter(x => x != "Plan" );

    let items = states;
    
    for(let i = 0; itemTypes[i] != itemType; i++){
        let newItems = [];
        for(const item of items){
            let itemNodes = await getItemsNodes(item, itemTypes[i]);
            
            await page.waitForTimeout(1000);
            
            newItems = newItems.concat(itemNodes);   
        }
        
        //Get no more than 7 items to open
        let shuffledItems = newItems.sort(function(){return .5 - Math.random()});
        let selectedItems = shuffledItems.slice(0,7);

        for(const itemNode of selectedItems){
            let arrow = await utils.getElementBySelector(itemNode, "img.scContentTreeNodeGlyph");
            await arrow.click();
            await page.waitForTimeout(400);
        }

        items = selectedItems;
        await page.waitForTimeout(3000);
    }

    return items;
}

async function getSample(items, itemType){
    let itemNodes = [];
    for(const item of items){

        let nodes = await getItemsNodes(item, itemType);

        //Get no more than 5 items to open
        let shuffledItems = nodes.sort(function(){return .5 - Math.random()});
        let selectedItems = shuffledItems.slice(0, 5);

        itemNodes = itemNodes.concat(selectedItems);
    }

    //Get no more than 5 items to open
    let shuffledItems = itemNodes.sort(function(){return .5 - Math.random()});
    let selectedItems = shuffledItems.slice(0, 5);

    return selectedItems;
}

async function runTest(page, items){
    await page.waitForTimeout(3000);

    let times = [];
    let randomIndex = -1;

    for(let i = 0; i < config.tries; i++){
        randomIndex = utils.getNewRandomIndex(items.length, randomIndex);
        const item = items[randomIndex];

        const node = await item.waitForSelector("a.scContentTreeNodeNormal");
        const idObject = await node.getProperty("id");
        const nodeid = idObject._remoteObject.value;
        const itemID = nodeid.replace("Tree_Node_", "");

        const startTime = new Date();
        await node.click();
        await page.waitForSelector("#FContent" + itemID);
        
        const endTime = new Date();
        const time = (endTime.getTime() - startTime.getTime())/1000;
        
        times.push({ index: i, time: time, item_ID: itemID });
    }

    showResults(times);
}

function showResults(times) {
    const average = times.reduce((a, b) => a + b.time, 0) / times.length;
    times.push({ index: "Average", time: average });

    const transformed = times.reduce((acc, {index, ...x}) => { acc[index] = x; return acc}, {})

    console.table(transformed);
}

module.exports = { run };