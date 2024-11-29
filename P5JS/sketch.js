let img1

let locations

async function setup() 
{
  createCanvas(400, 400);

  img1 = getImageOfMap(10.1867478,56.1558959,10.1886893,56.1564629);
  locations = await getGPSData();
  console.log(locations);
}

function draw() 
{
  background(220);
  circle(200, 200, 200);
  image(img1,0,0)
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
    
  return dataGPSpositions
}

function getImageOfMap(BottomLeftLong, BottomLeftLat, TopRightLong, TopRightLat)
{
  let image = loadImage(`https://maps.hereapi.com/mia/v3/base/mc/bbox:${BottomLeftLong},${BottomLeftLat},${TopRightLong},${TopRightLat};padding=30/512x512/png?apiKey=vksGt8EHchIQQ4cHA3OElYoeypGI9JcFD1JR4Qa-8bY`);
    
  return image
}