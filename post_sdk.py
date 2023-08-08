import json
import requests
import datetime
import time

from read_gps import *
from bme import *
from libs import *

a = 1
while a > 0:
  try:
    now = datetime.datetime.now()
    timestamp = now.timestamp()
    lon, lat, gps_h = read_geo()
    gps_speed = read_spd()

    temperature,pressure,humidity = readBME280All()
    temperature = rounddata(temperature,1)
    pressure = rounddata(pressure,1)
    humidity = rounddata(humidity,1)
    dt = rounddata(dewPointFast(temperature,humidity),1)
    tmslp = rounddata(mslp(pressure,temperature,gps_h),1)
    
    std_json = {
    "timestamp": timestamp,
    "instrument": "tqm Station",
    "observation": 
        {
            "t": temperature, "rh": humidity, "dt": dt, "p": pressure, "mslp": tmslp
          },
    "wind":
        {
            "spd": None, "dir": None
        },
    "gps": 
        {
            "lat": lat, "long": 113.939, "alt": gps_h, "dir": 0, "speed": gps_speed
          },
            }

    resp = requests.post(
                    url='http://track.storm-chasers.cn/api/receive_meteo_data_json',
                    data=json.dumps(std_json)
                    )
    print(resp.json)
  except:
     print("error")
  time.sleep(20)