from datetime import datetime
from os import DirEntry
from typing import Iterable


def clamp(num, min_value, max_value):
   return max(min(num, max_value), min_value)


def fetch_tmp_start_idx_as_int(elem: DirEntry[str]) -> int:
    return int(elem.name[4:elem.name.find('-')])


def linear_interp(lhs, rhs, left_walk: float):
    """
    Linear interpolation between the two given quantities

    Args:
        lhs: Left-hand side interpolant
        rhs: Right-hand side interpolant
        left_frac: How much of the way to 'walk' along the value from left to right

    Returns:
        Interpolated value between lhs and rhs
    """
    return (lhs * (1 - left_walk)) + (rhs * left_walk)


def compute_genre_set(steam_data: dict) -> set[str]:
    """
    Compute set of all genres in the Steam dataset

    Args:
        steam_data: Kaggle database as loaded JSON form of `data_set.json

    Returns:
        Set containing all genres found in the dataset    
    """
    genre_set = set()
    for game in steam_data:
        for genre in game["genre"]:
            genre_set.add(genre)
    return genre_set


def try_parsing_date(text: str, formats: Iterable[str] = ['%Y/%m/%d']):
    """
    Attempt to parse a given date string using the given formats
    (https://stackoverflow.com/a/23581184/14247568)

    Args:
        text: String to parse
        formats: Iterable of all formats to try

    Returns:
        Parsed date as date part of datetime
    """
    for fmt in formats:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            pass
    raise ValueError(f'No valid date format found ({text})')
