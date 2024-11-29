#include <HTTPClient.h>

#include <WiFi.h>
#include <WiFiAP.h>
#include <WiFiClient.h>
#include <WiFiGeneric.h>
#include <WiFiMulti.h>
#include <WiFiSTA.h>
#include <WiFiScan.h>
#include <WiFiServer.h>
#include <WiFiType.h>
#include <WiFiUdp.h>

#include <SparkFun_I2C_GPS_Arduino_Library.h>
I2CGPS myI2CGPS;

#include <TinyGPS++.h>
TinyGPSPlus gps;


/*ADD FLLOWING CONSTANTS 
  const char* ssid = "";
  const char* password = "";
  const char* API_CODE = "";  //Api code to thingspeak 
*/

long rssi = 0;

void setup() 
{
    // put your setup code here, to run once:
    Serial.begin(115200);
    Serial.println("Is anything working?");
    delay(100);
    if (myI2CGPS.begin() == false)
    {
      Serial.println("Module failed to respond. Please check wiring.");
      while (1); //Freeze!
    }
    Serial.println("GPS module found!");

    pinMode(LED_BUILTIN , OUTPUT);
    delay(1000);
    Serial.println("It works!");

    WiFi.mode(WIFI_STA); //Optional
    WiFi.begin(ssid, password);
    Serial.println("\nConnecting");

    while(WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(100);
    }

    Serial.println("\nConnected to the WiFi network");
    Serial.print("Local ESP32 IP: ");
    Serial.println(WiFi.localIP());
}

String sendCurl(String page = "https://api.chess.com/pub/player/frederikvase/games")
{
    while (true)
    {
        if(WiFi.status()== WL_CONNECTED)
        {
            HTTPClient http;

            String serverPath = page;
            http.begin(serverPath.c_str());
            int httpResponseCode = http.GET();

            if (httpResponseCode>0) 
            {
                String payload = http.getString();

                if (payload == "0")
                {
                  Serial.print(0);
                  delay(20);
                  continue;
                }

                return payload;
            }
            http.end();
        }
        else
            Serial.println("WiFi Disconnected");
    }
}

double lastX = -42.0;
double lastY = -42.0;

double maxDist = 0.00006;
bool hasMoved(double x, double y)
{
  Serial.print(x, 8);
  Serial.print(", ");
  Serial.print(y, 8);
  Serial.print(" : ");
  Serial.print(lastX, 8);
  Serial.print(", ");
  Serial.println(lastY, 8);

  if ((x-lastX)*(x-lastX) + (y-lastY) * (y-lastY) > maxDist*maxDist)
  {
    lastX = x;
    lastY = y;
    return true;
  }
  return false;
}

void loop() 
{
    while (myI2CGPS.available())
      gps.encode(myI2CGPS.read());

    delay(50);
    if (gps.time.isUpdated() && gps.location.isValid() && hasMoved(gps.location.lng(), gps.location.lat()))
    {
      String req = "https://api.thingspeak.com/update.json?api_key=" + API_CODE + "&field1=1&field2=" + String(lastX, 8) + "&field3=" + String(lastY, 8);
      String movedata = sendCurl(req);
      Serial.println(movedata);
      delay(500);
    }
}