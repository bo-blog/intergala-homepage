const createObjFromArrays = (keys, values) => 
  keys.reduce((obj, key, index) => 
    ({ ...obj, [key]: values[index] }), {});

let isPreview = 0;
const onRadioChange = () => {
    isPreview = document.querySelector('[name=isPreview]:checked').value;
    console.log(isPreview);
}
document.querySelectorAll('[name=isPreview]').forEach(input => input.addEventListener('change', onRadioChange))


function extractFromSrc() {
    document.getElementById("area").innerHTML="";
    document.getElementById("car").innerHTML="";
    document.getElementById("pic").innerHTML="";
    document.getElementById("download").style.display="none";

    let src = document.querySelector("#bodyText");
    let txt = "";
    const parser = new DOMParser();
    if (src) {
        txt = src.value;
    }
    const doc = parser.parseFromString(txt, 'text/html');
    const baseURL = isPreview == 1 ? "https://prod65-author-internal.australia.com" : isPreview == 2 ? "https://www.australia.com" : "https://www.australia.cn"
    let allHeadings = getAll("cmp-listicle__numberHeading", doc);
    let allTitles = getAll("cmp-listicle__title", doc);

    allHeadings = allHeadings.filter((_, index) => index % 2 !== 0);
    allTitles = allTitles.filter((_, index) => index % 2 !== 0);

    if (allHeadings.length > 20) {
        alert ("More than 20 items! Item 21 onwards are discarded.");
        allHeadings = allHeadings.slice (0, 20);
    }
    let allSubheads = createObjFromArrays (allHeadings, allTitles);
    for (num in allSubheads) {
        let sub = allSubheads[num];
        let modifier = `<input type="text" class="num" value="${num}"> <input type="text" class="sub" value="${sub}"><br>`;
        document.getElementById("area").innerHTML = document.getElementById("area").innerHTML + modifier;
    }
    document.getElementById("gen").style.display = "block";

    const allCarousels = doc.querySelectorAll(".slide-carousel");
    let allImageCarousels = [];
    let i = 1;
    let allDesc = "";
    allCarousels.forEach(carousel => {
        const allItems = carousel.querySelectorAll(".slide-item");
        let k = 1;
        allItems.forEach (item => {
            const img = item.querySelector("img");
            let src = baseURL + img.getAttribute("src");
            if (allImageCarousels[i]) {
                allImageCarousels[i].push({src: src, desc: img.alt});
            } else {
                allImageCarousels[i] = [];
                allImageCarousels[i][0] = {src: src, desc: img.alt};
            }
            const addImg = new Image();
            addImg.src = src;
            addImg.alt = `carousel-${i}-${k}`;
            document.getElementById("car").appendChild(addImg);
            
            allDesc += `carousel-${i}-${k}: <br><input onmouseover="this.select()" onclick="document.execCommand('copy');" type="text" value="` + img.alt + "\"><br><br>";
            k++;
        });
        i++;
    });
    document.getElementById("des").innerHTML = allDesc;

    const titleImgURL = baseURL + doc.querySelector(".ta-hero-image").getAttribute("src").replace(/mobile.adapt.768.high.jpg/, "desktop.adapt.1920.high.jpg");
    let titleImg = new Image();
    titleImg.src = titleImgURL;
    titleImg.alt = "title";
    document.getElementById("car").appendChild(titleImg);

    let allText = "";
    let alternativeStyle = doc.querySelector(".ta-lead-paragraph") ? true : false;
    if (doc.querySelector("#titleContent")) {
        allText += doc.querySelector("#titleContent").innerText.trim();
        allText += "\r\n";
    }
    if (!alternativeStyle) {
        if (doc.querySelector(".summary")) {
            allText += doc.querySelector(".summary").innerText.trim();
            allText += "\r\n\r\n";
        }
        if (doc.querySelector(".byline-inner_main")) {
            allText += doc.querySelector(".byline-inner_main").innerText.trim();
            allText += "\r\n\r\n";
        }
    }
    else {
        allText += doc.querySelector(".ta-lead-paragraph").innerText.trim();
        allText += "\r\n\r\n";
        allText += doc.querySelector(".ta-lead-paragraph").parentElement.nextElementSibling.innerText.trim();
        allText += "\r\n\r\n";        
    }

    let allBodyText = doc.querySelectorAll(".ta-article-text");
    const allSecHead = doc.querySelectorAll(".cmp-listicle__sectionHeading");

    if (alternativeStyle) {
        allBodyText = Array.from(allBodyText).slice(2);
    }

    for (n = 0; n < allSecHead.length; n++) {
        allText += allHeadings[n] + ". " + allTitles[n];
        allText += "\r\n";
        allText += allSecHead[n].innerText.trim();
        allText += "\r\n";
        allText += allBodyText[n].innerText.trim();
        allText += "\r\n\r\n";
    }

    document.getElementById("txt").value = allText;
    document.getElementById("txt").style.display="block";
}

function createImages() {
    document.getElementById("pic").innerHTML="";

    let allHeadings = [];
    document.querySelectorAll(".num").forEach(num => {
        allHeadings.push(num.value);
    });

    let allTitles = [];
    document.querySelectorAll(".sub").forEach(num => {
        allTitles.push(num.value);
    });

    let allSubheads = createObjFromArrays (allHeadings, allTitles);

    
    for (num in allSubheads) {
        console.log("Generating Title " + num);
        let sub = allSubheads[num];
        let original = `original/Sub-${num}.jpg`;
        const font = "Noto Serif SC";
        const size = 54;
        const left = num > 9 ? 264 : 192;
        const isDisplay = true;
        addTextToImage(num, original, sub, font, size, left, true, isDisplay)
    }
    document.getElementById("download").style.display = "block";
}

function getAll(className, doc) {
    const elements = doc.querySelectorAll(`.${className}`);
    let arrOutput = [];
    elements.forEach((ele) => {
        arrOutput.push(ele.innerText.trim());
    })
    return arrOutput;
}

// 用于存储生成的图片信息（原始文件名和图片数据）
const generatedImages = [];

// 带ID参数的图片处理函数
function addTextToImage(ID, original, txt, font, size, left, isBold, isDisplay) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = original;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // 绘制原图
            ctx.drawImage(img, 0, 0);
            
            // 处理字体样式
            const fontWeight = isBold ? 'bold ' : '';
            const safeFont = font.includes(' ') ? `"${font}"` : font;
            ctx.font = `${fontWeight}${size}pt ${safeFont}`;
            ctx.fillStyle = 'black';
            
            // 计算垂直居中基准位置
            const textMetrics = ctx.measureText(txt);
            const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
            const lineHeight = textHeight * 1.2; // 行高为文字高度的1.2倍
            
            // 拆分文本为每行不超过12个汉字
            const maxCharsPerLine = 12;
            const lines = [];
            let currentLine = '';
            
            for (let i = 0; i < txt.length; i++) {
                currentLine += txt[i];
                // 每满12个字符换行
                if (currentLine.length >= maxCharsPerLine) {
                    lines.push(currentLine);
                    currentLine = '';
                }
            }
            
            // 添加最后一行
            if (currentLine) {
                lines.push(currentLine);
            }
            
            // 处理换行后的空格：去除每行开头的空格（第一行除外）
            for (let i = 1; i < lines.length; i++) {
                // 使用trimStart()去除开头空格，兼容所有空白字符
                lines[i] = lines[i].trimStart();
            }
            
            // 计算整体文本块的起始Y坐标（使整个文本块垂直居中）
            const totalTextHeight = lines.length * lineHeight;
            const startY = (canvas.height - totalTextHeight) / 2 + textHeight;
            
            // 逐行绘制文字
            lines.forEach((line, index) => {
                const y = startY + (index * lineHeight);
                ctx.fillText(line, left, y);
            });
            
            // 生成结果图片
            const resultImg = new Image();
            const dataUrl = canvas.toDataURL();
            resultImg.src = dataUrl;
            resultImg.alt = original.split("/")[1].split(".")[0];
            
            // 仅保留order样式
            resultImg.style.order = ID;
            
            // 提取原始文件名
            const fileName = original.split('/').pop().split('\\').pop();
            
            // 存储生成的图片信息，包含ID
            generatedImages.push({
                id: ID,
                fileName: fileName,
                dataUrl: dataUrl
            });
            
            // 将图片添加到名为pic的div中
            if (isDisplay && resultImg) {
                const picContainer = document.getElementById('pic');
                if (picContainer) {
                    // 确保容器启用flex布局以让order属性生效
                    if (getComputedStyle(picContainer).display !== 'flex') {
                        picContainer.style.display = 'flex';
                        picContainer.style.flexWrap = 'wrap'; // 允许换行
                    }
                    picContainer.appendChild(resultImg);
                } else {
                    console.warn('未找到id为"pic"的容器，无法显示图片');
                }
            }
            
            resultImg.onload = () => resolve(resultImg);
        };
    });
}

// 打包下载函数
function dlImages() {
    if (generatedImages.length === 0) {
        alert('没有可下载的图片，请先生成图片');
        return;
    }
    
    if (typeof JSZip === 'undefined') {
        alert('请先引入JSZip库');
        return;
    }
    
    // 按ID排序后再打包
    const sortedImages = [...generatedImages].sort((a, b) => a.id - b.id);
    
    const zip = new JSZip();
    
    sortedImages.forEach(item => {
        const base64Data = item.dataUrl.split(',')[1];
        const content = atob(base64Data);
        const bytes = new Uint8Array(content.length);
        
        for (let i = 0; i < content.length; i++) {
            bytes[i] = content.charCodeAt(i);
        }
        
        zip.file(item.fileName, bytes, { binary: true });
    });
    
    zip.generateAsync({ type: 'blob' })
        .then(function(content) {
            const link = document.createElement('a');
            link.download = 'generated_images.zip';
            link.href = URL.createObjectURL(content);
            link.click();
            URL.revokeObjectURL(link.href);
        })
        .catch(function(error) {
            console.error('打包下载失败:', error);
            alert('下载失败，请重试');
        });
}

function resizeImageWithRoundedCorners(original, targetWidth, targetHeight, padding) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = original;
        
        img.onload = function() {
            // 计算包含padding的总宽度
            const totalWidth = targetWidth + 2 * padding; // 左右各加padding
            const totalHeight = targetHeight; // 高度不变
            
            // 创建Canvas元素
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置Canvas尺寸为包含padding的总尺寸
            canvas.width = totalWidth;
            canvas.height = totalHeight;
            
            // 绘制带圆角的矩形作为裁剪区域（包含padding区域）
            const radius = 15; // 圆角半径
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.arcTo(totalWidth, 0, totalWidth, totalHeight, radius);
            ctx.arcTo(totalWidth, totalHeight, 0, totalHeight, radius);
            ctx.arcTo(0, totalHeight, 0, 0, radius);
            ctx.arcTo(0, 0, totalWidth, 0, radius);
            ctx.closePath();
            
            // 设置裁剪区域
            ctx.clip();
            
            // 绘制并缩放图片（向右偏移padding距离）
            ctx.drawImage(
                img, 
                0, 0, 
                img.width, img.height, 
                padding, 0, // 左侧留出padding空间
                targetWidth, targetHeight
            );
            
            // 创建结果图片（指定为PNG格式）
            const resultImg = new Image();
            resultImg.src = canvas.toDataURL('image/png'); // 强制使用PNG格式以保留透明
            
            // 图片加载完成后返回
            resultImg.onload = () => resolve(resultImg);
        };
    });
}

// 使用示例：
// resizeImageWithRoundedCorners('original.jpg', 300, 200, 20)
//     .then(processedImg => {
//         console.log('处理后的图片:', processedImg);
//         // 可以将图片添加到页面
//         document.getElementById('pic').appendChild(processedImg);
//     });
    