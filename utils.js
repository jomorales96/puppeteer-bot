async function getFirstElementFromPropertyAndValue(rootElement, selector, prop, value){
    await rootElement.waitForSelector(selector);
    const elements = await rootElement.$$(selector);

    for(let i = 0; i < elements.length; i++){
        const textObject = await elements[i].getProperty(prop);
        const text = textObject._remoteObject.value;
        if (text == value){
            return elements[i];
        }
    };

    return null;
}

async function getElementFromChildrenPropertyValue(rootElement, selector, childrenSelector){
    await rootElement.waitForSelector(selector);
    const elements = await rootElement.$$(selector);

    let list = [];
    for(let i = 0; i < elements.length; i++){
        const children = await getElementBySelector(elements[i], childrenSelector);
        
        if(children){
            list.push(elements[i]);
        }
            
    };
    return list;
}

async function getElementBySelector(rootElement, selector){
    const elements = await rootElement.$$(selector);

    return elements[0];
}

function getNewRandomIndex(arrayLength, currentIndex){
    let newIndex = currentIndex;
    while(newIndex == currentIndex){
        newIndex = Math.floor(Math.random() * arrayLength);
    }

    return newIndex;
}

module.exports = {
    getFirstElementFromPropertyAndValue,
    getElementFromChildrenPropertyValue,
    getElementBySelector,
    getNewRandomIndex
};