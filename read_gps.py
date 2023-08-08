import serial
import pynmea2

def ddmmtoddd(lon, lat):
    lon = str(lon/100)
    lon = lon.split(".")[0] + "." + str(int((lon.split("."))[1])/100*100/60).replace(".", "")[:9]
     
    lat = str(lat/100)
    lat = lat.split(".")[0] + "." + str(int((lat.split("."))[1])/100*100/60).replace(".", "")[:9]
    return lon, lat #fuck dms

def read_spd():
    speed = 0
    gps = serial.Serial('/dev/ttyAML2', 9600, timeout=0.2) #NanoPiK2
    while True:
        gps_recv = gps.readline().decode('ascii', errors='replace')
        if gps_recv.startswith('$'):
            rmc = pynmea2.parse(gps_recv)
            if gps_recv.startswith('$GNVTG'):
                speed = float(rmc.spd_over_grnd_kmph)
                return speed
        else:
            return speed
            #print("Speed:",float(rmc.spd_over_grnd_kmph),"km/h")
def read_geo():
    lon, lat, alt = 113.95705, 22.539067, 25
    gps = serial.Serial('/dev/ttyAML2', 9600, timeout=0.2) #NanoPiK2
    while True:
        gps_recv = gps.readline().decode('ascii', errors='replace')
        if gps_recv.startswith('$'):
            rmc = pynmea2.parse(gps_recv)
            if gps_recv.startswith('$GNGGA'):
                '''
                if rmc.gps_qual == 1 or rmc.gps_qual == 2:
                    status = "定位成功"
                else:
                    status = "等待定位"
                '''
                lon, lat = ddmmtoddd(float(rmc.lon) ,float(rmc.lat))
                alt = float(rmc.altitude)
                #print("双模定位状态:" + status)
                #print('GPS+BD availabe:', rmc.num_sats)
                #print("Lat:",lat,"Lon:",lon,"Alt:",float(rmc.altitude),"m")
                return lon, lat, alt
        else:
            return lon, lat, alt
        '''
        elif gps_recv.startswith('$GPGSV') or gps_recv.startswith('$BDGSV'):
                if gps_recv.startswith('$GPGSV'):
                    if rmc.msg_num =='1':
                        print('GPS in View:', rmc.num_sv_in_view)
                if gps_recv.startswith('$BDGSV'):
                    if rmc.msg_num =='1':
                        print('BD in View:', rmc.num_sv_in_view)
                        '''