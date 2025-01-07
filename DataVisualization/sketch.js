let classificationData = [];
let dataPastTwentyFourHours = [];
let timeActivityIsDone = []

const backgroundColor = 220;

async function setup()
{
	classificationData = await getVideoData() || [];
	createCanvas(400, 400);
	console.log(classificationData);
	dataPastTwentyFourHours = theLastTwentyFourHours(classificationData);
	timeActivityIsDone = getAmountOfEachActivitiesDone();
  
    angleMode(RADIANS);
    textAlign(CENTER);

}

function draw() 
{
	background(backgroundColor);
    drawDonut(150, 150, 130);
}

async function getVideoData()
{
	let url = `https://api.thingspeak.com/channels/2773097/fields/1.json?api_key=${VIDEO_DATABASE_API_CODE}`;
	let dataTags;

	await fetch(url)
		.then(response => response.json())
		.then(data => {
		dataTags = data.feeds;
		})
		.catch(err => console.error("THIS IS AN ERROR FROM GET VIDEO DATA\n", err));
		
	return dataTags || [];
}

function theLastTwentyFourHours(data = classificationData)
{
	const informationThisDate = [];
  	const currentDate = new Date();

	for(let i = data.length - 1; i >= 0; i--)
	{
		const dataDate = new Date(data[i]["created_at"]);
		const dataTag = data[i]["field1"];

		const hoursDifference = (currentDate - dataDate) / (1000 * 60 * 60) - 59; // remove -59 later 
		
		if(hoursDifference <= 2400)
		{
			informationThisDate.push({date : dataDate, tag : dataTag});
		}else{
			console.log("NO MORE TAGS PAST 24 HOURS");
			break;
		}
	}
	console.log(informationThisDate);
	return informationThisDate;
}

function getAmountOfEachActivitiesDone(data = dataPastTwentyFourHours)
{
	let timeEachActivityDone = {};

	for(let i = 0; i < data.length - 1; i++)
    {
		const currentObject = data[i + 1]; //contains date & tag
		const nextObject = data[i]; //this is nextObject becase data is in reverse

		const activityDone = currentObject.tag;
		const timeDoneInSecounds = (nextObject.date - currentObject.date) / 1000;

		timeEachActivityDone[activityDone] = (timeEachActivityDone[activityDone] || 0 ) + timeDoneInSecounds;
		timeEachActivityDone["total"] = (timeEachActivityDone["total"] || 0) + timeDoneInSecounds;
	}

	console.log(timeEachActivityDone);
	return timeEachActivityDone;
}

function drawDonut(x, y, radius)
{
  colorMode(HSB);
  noStroke();
  fill(255)
  circle(x, y, 2*radius);
  
  textSize(radius * 0.12);


  let total;
  let activities = [];
  
  for (let activity in timeActivityIsDone)
  {
    let time = timeActivityIsDone[activity];
    if (activity == "total")
      total = time;
    else
    {
      if (activity == "outoor")
        activities.push(["outdoor", time]);
      else
        activities.push([activity, time]);

    }
  }
  
  let sum = 0;
  for (let i = 0; i < activities.length; i++)
  {
    beginShape();
    vertex(x, y);

    fill(((sum + activities[i][1] / 2) / total) * 255, 96 * 255 / 100, 47 * 255 / 100);
    
    let startAngle = sum / total * 2 * PI - PI / 2;
    let endAngle = (sum + activities[i][1]) / total * 2 * PI - PI / 2;
    for (let theta = startAngle; 
         theta <= endAngle; 
         theta += 2 * PI / 100)
    {
      vertex(x + cos(theta) * radius, y + sin(theta) * radius);
    }
    vertex(x + cos(endAngle) * radius, y + sin(endAngle) * radius);

    endShape();
    
    sum += activities[i][1] / 2;
    
    fill(0);
    
    text(activities[i][0],
         x + cos(sum/total * 2 * PI - PI / 2) * radius * 0.6,
         y + sin(sum/total * 2 * PI - PI / 2) * radius * 0.6);
    sum += activities[i][1] / 2;
  }
  
  colorMode(RGB);
  fill(backgroundColor);
  circle(x, y, radius * 0.6);
  
}

function drawTimeLine(l, r, t, d)
{
  
}