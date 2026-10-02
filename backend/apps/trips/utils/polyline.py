from array import array

from apps.trips.constants import POLYLINE_PRECISION

CHUNK_MASK = 0x1F
CONTINUATION_BIT = 0x20
ASCII_OFFSET = 63
BITS_PER_CHUNK = 5


def _read_value(encoded: str, index: int) -> tuple[int, int]:
    shift = result = 0
    while True:
        chunk = ord(encoded[index]) - ASCII_OFFSET
        index += 1
        result |= (chunk & CHUNK_MASK) << shift
        shift += BITS_PER_CHUNK
        if chunk < CONTINUATION_BIT:
            break
    return (~(result >> 1) if result & 1 else result >> 1), index


def decode_polyline(encoded: str, precision: int = POLYLINE_PRECISION) -> tuple[array, array]:
    factor = 10**precision
    lats, lngs = array("d"), array("d")
    index = lat = lng = 0
    while index < len(encoded):
        delta_lat, index = _read_value(encoded, index)
        delta_lng, index = _read_value(encoded, index)
        lat += delta_lat
        lng += delta_lng
        lats.append(lat / factor)
        lngs.append(lng / factor)
    return lats, lngs
