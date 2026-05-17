function extractFromSrc() {
    const baseURL = "https://www.australia.cn";

    let src = document.querySelector("#bodyText");
    let txt = "";
    const parser = new DOMParser();
    if (src) {
        txt = src.value;
    }
    const doc = parser.parseFromString(txt, 'text/html');
    let allHeadings = doc.querySelector("[id^='highlights-carousel-app-']", doc).getAttribute("data-cq-model");
    allHeadings = JSON.parse(allHeadings);
    allHeadings = allHeadings.highlights;
    console.log(allHeadings);
    if (allHeadings.length > 8) {
        alert ("More than 8 items! Item 9 onwards are discarded.");
        allHeadings = allHeadings.slice (0, 8);
    }
    for (num in allHeadings) {
        let aNum = Math.floor(num) + 1;
        let sub = `#g${aNum} .title-input`;
        let sut = `#g${aNum} .body-input`;
        console.log(sub)
        document.querySelector(sub).value = allHeadings[num].title;
        document.querySelector(sut).value = allHeadings[num].text.replace(/<[^>]+>/g, '');
    }
}

function getAll(className, doc) {
    const elements = doc.querySelectorAll(className);
        //console.log(doc);

    let arrOutput = [];
    elements.forEach((ele) => {
        arrOutput.push(ele.innerText.trim());
    })
    return arrOutput;
}