import urllib
import requests
import datetime

def fetch(s, timerange):
    url = "https://track.storm-chasers.cn/api/get_custom_instrument_dataset?instrument=tqm%20Station&dataname="+ s +"&timerange=" + timerange
    fn = "./Sensordata/Sensor_"+ s + "_" + datetime.datetime.now().strftime("%Y%m%d%H%M%S") + ".json"
    urllib.request.urlretrieve(url, fn)
    return fn
