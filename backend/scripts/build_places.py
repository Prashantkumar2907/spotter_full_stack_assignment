import csv
import io
import sys
import urllib.request
import zipfile
from pathlib import Path

GEONAMES_URL = "https://download.geonames.org/export/dump/cities1000.zip"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "apps/trips/data/us_places.csv"
ARCHIVE_MEMBER = "cities1000.txt"
COUNTRY_COLUMN = 8
NAME_COLUMN = 1
LAT_COLUMN = 4
LNG_COLUMN = 5
STATE_COLUMN = 10
POPULATION_COLUMN = 14
US_COUNTRY_CODE = "US"
HEADER = ("name", "state", "lat", "lng", "population")


def download_archive(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=120) as response:
        return response.read()


def iter_us_rows(archive: bytes):
    with zipfile.ZipFile(io.BytesIO(archive)) as bundle, bundle.open(ARCHIVE_MEMBER) as handle:
        for line in io.TextIOWrapper(handle, encoding="utf-8"):
            columns = line.rstrip("\n").split("\t")
            if columns[COUNTRY_COLUMN] == US_COUNTRY_CODE:
                yield columns


def to_record(columns: list[str]) -> tuple:
    return (
        columns[NAME_COLUMN],
        columns[STATE_COLUMN],
        columns[LAT_COLUMN],
        columns[LNG_COLUMN],
        columns[POPULATION_COLUMN],
    )


def main() -> int:
    records = sorted(to_record(columns) for columns in iter_us_rows(download_archive(GEONAMES_URL)))
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(HEADER)
        writer.writerows(records)
    print(f"wrote {len(records)} places to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
