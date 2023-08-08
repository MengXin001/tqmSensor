def dewPointFast(celsius, humidity):
    """
    快速露点计算
    :param celsius: 摄氏度温度
    :param humidity: 相对湿度
    :return: float 露点
    """
    import math
    a = 17.271
    b = 237.7
    temp = (a * celsius) / (b + celsius) + math.log(humidity / 100)
    Td = (b * temp) / (a - temp)
    return round(Td, 2)
def mslp(p, t, h):
    '''Pressure to MSLP'''
    return p * (1 - 0.0065 * h / (t + 0.0065 * h + 273.15)) ** -5.257
def rounddata(num, level):
    return round(num, level)