import json
import requests
import datetime
import time

from read_gps import *
from bme import *
from libs import *

while True:
    try:
        now = datetime.datetime.now()
        timestamp = now.timestamp()
        lon, lat, gps_h = read_geo()
        gps_speed = read_spd()
        temperature,pressure,humidity = readBME280All()
        temperature = rounddata(temperature,1)
        pressure = rounddata(pressure,2)
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
                "lat": lat, "long": lon, "alt": gps_h, "dir": 0, "speed": gps_speed
            },
                }
        s = requests.session()
        s.keep_alive = False
        resp = s.post(
                        url='http://track.storm-chasers.cn/api/receive_meteo_data_json',
                        data=json.dumps(std_json)
                        )
        print(resp.json)
    except:
        print("error")
    time.sleep(10)
