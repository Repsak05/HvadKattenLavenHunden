let img1;
let locations;
let pointValues = [];

const imageWidth = 512;
const imageHeight = 512;

var YCenter, XCenter;
var sideLength;

var north, east, south, west;

async function setup() 
{
    createCanvas(1500, 1500);
    locations = await getGPSData();
    // locations = locations.slice(0,3);
    
    if(locations.length)
    {
        setCenterAndSideLength(locations);
    }
    
    console.log(west, south, east, north);

    if(north && east && south && west)
        img1 = await getImageOfMap();

    console.log(locations);

    // pointValues.push(convertToCanvasPosition(west, south));
    // pointValues.push(convertToCanvasPosition(east, south));
    // pointValues.push(convertToCanvasPosition(west, north));
    // pointValues.push(convertToCanvasPosition(east, north));

    console.log("CORNER: " + south + ", " + west);
    console.log("AnvertToCanvasPosition(south, west");
    console.log("sidelength", sideLength);

    for(let key in locations)
        pointValues.push(convertToCanvasPosition(locations[key].field2, locations[key].field3));

}

function draw() 
{
    background(220);
    image(img1, 150, 150);

    for(let i = 0; i < pointValues.length - 1; i++){
        let  cur = pointValues[i];
        let  next = pointValues[i+1];

        line(150 + cur[0], 150 + cur[1], 150 +  next[0], 150 + next[1]);
    }

    if (pointValues.length > 0)
    {
        for(let point of pointValues)
            circle(150 + point[0], 150 + point[1], 5);
    }
}

async function getGPSData()
{
    let url = `https://api.thingspeak.com/channels/2764277/feeds.json?api_key=${DATABASE_API_CODE}`;
    let dataGPSpositions;

    await fetch(url)
        .then(response => response.json())
        .then(data => {
        dataGPSpositions = data.feeds;
        })
        .catch(err => console.error(err));
        
    return dataGPSpositions;
}

async function getImageOfMap()
{
    const url =`https://maps.hereapi.com/mia/v3/base/mc/bbox:${west},${south},${east},${north};padding=0/${imageWidth}x${imageHeight}/png?apiKey=vksGt8EHchIQQ4cHA3OElYoeypGI9JcFD1JR4Qa-8bY`
    let image = loadImage(url);
    console.log(url);
    return image;
}

function convertToCanvasPosition(x, y) 
{
    // console.log("Hahah: " + x + " - " + west + " = " + (x - west));
    // console.log("Hmm: (" + x + " -" + west, ") / ", sideLength, " * ", imageWidth);
    let placementX = (x - west) / sideLength * imageWidth;
    let placementY = imageHeight - (y - south) / sideLength * imageHeight;

    // console.log("POINT:", x, y);
    // console.log("Y%: ", (y - south) / sideLength);
    console.log(placementX, placementY)

    // console.log("y", y, "\nsouth", south, "\nnorth", north);

    return [placementX, placementY];
}

function setCenterAndSideLength(locations = [])
{
    let minY = Infinity;
    let maxY = -Infinity;

    let minX = Infinity;
    let maxX = -Infinity;

    for(let key in locations)
    {
        let location = locations[key];
        let X = location.field2;
        let Y = location.field3;

        minY = min(minY, Y);
        maxY = max(maxY, Y);
        
        minX = min(minX, X);
        maxX = max(maxX, X);
    }

    sideLength = max(0.003, max(maxY - minY, maxX - minX) * 1.25);
    XCenter = (maxX + minX) / 2;
    YCenter = (maxY + minY) / 2;

    console.log(XCenter, YCenter);

    west = XCenter - sideLength / 2;
    east = XCenter + sideLength / 2;
    south = YCenter - sideLength / 2;
    north = YCenter + sideLength / 2;
}