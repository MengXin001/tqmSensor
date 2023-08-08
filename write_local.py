import datetime
import queue
import threading
import struct
import sys

from bme import *
from libs import *

data_queue = queue.Queue()
stop_event = threading.Event()

f = open(f'P_{datetime.datetime.now().strftime("%Y%m%d%H%M%S")}.bin', 'wb')

def read_data():
    time.sleep(1)
    while not stop_event.is_set():
        now = datetime.datetime.now()
        timestamp = now.timestamp()
        gps_h = 50.4
        gps_lat = 114.5
        gps_lon = 22.5
        temperature,pressure,humidity = readBME280All()
        temperature = rounddata(temperature,1)
        pressure = rounddata(pressure,2)
        hummidity = rounddata(humidity,1)
        dt = dewPointFast(temperature,humidity)
        tmslp = mslp(pressure,temperature,gps_h)
        data = (int(pressure), int(timestamp)) #ms use int(timestamp % 1 * 1000)
        data_queue.put(data)
        print(data)
def write_data():
    data_pointer = 0
    while not stop_event.is_set():
        data = data_queue.get()
        f.write(struct.pack('ii', *data))
        print(struct.pack('ii', *data))
        data_pointer += 1
        if data_pointer == 20:
            f.flush()
            data_pointer = 0

def start_reading_thread():
    time.sleep(10)
    thread = threading.Thread(target=read_data)
    thread.start()
    return thread

def start_writing_thread():
    thread = threading.Thread(target=write_data)
    thread.start()
    return thread

if __name__ == '__main__':
    t1 = start_reading_thread()
    t2 = start_writing_thread()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_event.set()
        sys.exit(0)