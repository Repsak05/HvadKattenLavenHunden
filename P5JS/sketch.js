let img1;
let locations;
let pointValues = [];

const imageWidth = 512;
const imageHeight = 512;

//Image offset of top left corner of canvas
const offsetX = 50;
const offsetY = 50;

var YCenter, XCenter;
var sideLength;

var north, east, south, west;

async function setup() 
{
    createCanvas(imageWidth + 2*offsetX, imageHeight + 2 * offsetX);
    locations = await getGPSData();
    
    //TODO: The following to slices shows huge difference in placement
    // locations = locations.slice(10,15);
    // locations = locations.slice(9,15);
    
    if(locations.length){
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
    console.log("sidelength", sideLength);

    for(let key in locations)
        pointValues.push(convertToCanvasPosition(parseFloat(locations[key].field2), parseFloat(locations[key].field3)));

}

function draw() 
{
    background(220);
    image(img1, offsetX, offsetY);

    for(let i = 0; i < pointValues.length - 1; i++)
    {
        let  cur = pointValues[i];
        let  next = pointValues[i+1];

        line(offsetX + cur[0], offsetY + cur[1], offsetX + next[0], offsetY + next[1]);
    }

    if (pointValues.length >= 1){
        for(let point of pointValues){
            circle(offsetX + point[0], offsetY + point[1], 5);
        }
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
        .catch(err => console.error("THIS IS AN ERROR FROM GET GPSDATA", err));
        
    return dataGPSpositions || [];
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
    console.log("palcmenetXY", placementX, placementY)

    // console.log("y", y, "\nsouth", south, "\nnorth", north);

    return [placementX, placementY];
}

function setCenterAndSideLength(locations = [])
{
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    for(let key in locations)
    {
        let location = locations[key];
        let X = parseFloat(location.field2);
        let Y = parseFloat(location.field3);

        minX = min(minX, X);
        maxX = max(maxX, X);

        minY = min(minY, Y);
        maxY = max(maxY, Y);
    }

    sideLength = max(0.0012, max(maxY - minY, maxX - minX) * 1.25);
    XCenter = (maxX + minX) / 2;
    YCenter = (maxY + minY) / 2;
    
    west = XCenter - sideLength / 2;
    east = XCenter + sideLength / 2;
    south = YCenter - sideLength / 2;
    north = YCenter + sideLength / 2;
}