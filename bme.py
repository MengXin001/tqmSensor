import smbus2
import bme280

def readBME280All():
    port = 0
    address = 0x76
    bus = smbus2.SMBus(port)
    calibration_params = bme280.load_calibration_params(bus, address)
    data = bme280.sample(bus, address, calibration_params)
    return data.temperature,data.pressure,data.humidity