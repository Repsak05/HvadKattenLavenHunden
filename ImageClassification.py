import requests
import time
import json
from apiKeys import API_KEY, API_SECRET, API_KEY_THINGSPEAK
from urllib.parse import quote

#Computer vision of image
images = [
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479766493630544/Screenshot_2024-12-03_125934.png?ex=675048db&is=674ef75b&hm=53e302a251e6d6690a4221d4fe819f2814bed795074ea7aeb6725b7aa50a0b31&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479766845816913/Screenshot_2024-12-03_125948.png?ex=675048db&is=674ef75b&hm=133ca2bbf34d55e6605fc79d2b79a0d017d0a34286b7303cb015bd29fd889dd1&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479767177170969/Screenshot_2024-12-03_125959.png?ex=675048db&is=674ef75b&hm=aed12ba8462a38db92a17ec5393cef17fadc5011c0140ed9b008c5bbfcd14822&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479763997888593/Screenshot_2024-12-03_130145.png?ex=675048db&is=674ef75b&hm=6438d118d67ef9438b1836dbe0adbac43947ce53fd4cd7db6707d3337094d0d4&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479764291358842/Screenshot_2024-12-03_130207.png?ex=675048db&is=674ef75b&hm=df591303215180ddbcbe81e0dae3dc73c7c0980bd668e7160d41b1bb8fbd0bb5&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479764639744103/Screenshot_2024-12-03_130221.png?ex=675048db&is=674ef75b&hm=7a801397bd29680fc158060bee957e7073795c81d83b58d0e503cdc2386e7c38&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479764996263936/Screenshot_2024-12-03_130232.png?ex=675048db&is=674ef75b&hm=52c81306e5862dfa4f68e0d4ed613c0c7ce8bec40fccdad1f1e8ec32093b593d&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479765486866452/Screenshot_2024-12-03_130259.png?ex=675048db&is=674ef75b&hm=ceaaaedf536d62b7bef0967ab26185ff15c0e7551bf416a7d1de7cabeadfbaf5&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479765818081363/Screenshot_2024-12-03_130324.png?ex=675048db&is=674ef75b&hm=6586d485d1e03b6d6229db01c34d81d4be311c0963a60038cfc57d7a409b7adf&",
    "https://cdn.discordapp.com/attachments/1308047127318102117/1313479766132785162/Screenshot_2024-12-03_130447.png?ex=675048db&is=674ef75b&hm=80c563fb516c2c56356c37a48720aeb03eb54634400a1c23eb8b2d9503eb81dc&"
]

for image_url in images:
    print("NEW ROUND")
    encoded_url = quote(image_url, safe='')

    response = requests.get(
        f'https://api.imagga.com/v2/tags?image_url={encoded_url}',
        auth=(API_KEY, API_SECRET)
    )

    #Search for keywords
    indoorKeywords = ["indoor", "indoors","sofa", "kitchen", "table", "floor", "door", "furniture", "decor", "home", ]
    outoorKeywords = ["outdoor", "outdoors", "plants", "grass", "nature", "tree", "landscape", "forest"]
    eatingKeywords = ["food", "eating", "fruit" ]

    res = ""

    for key in response.json()["result"]["tags"]:
        guess = key["tag"]["en"]
        
        if guess in indoorKeywords:
            res = "indoor"
            break
        
        if guess in outoorKeywords:
            res = "outoor"
            break
        
        if guess in eatingKeywords:
            res = "eating"
            break

        
    #Post result to database
    if len(res) >= 1:
        postUrl = "https://api.thingspeak.com/update.json?api_key=" + API_KEY_THINGSPEAK + "&field1=" + res
        print("POSTED: ", postUrl)
        requests.get(postUrl)
        time.sleep(16)
    else:
        print("No result")
