from os import DirEntry


def clamp(num, min_value, max_value):
   return max(min(num, max_value), min_value)


def fetch_tmp_start_idx_as_int(elem: DirEntry[str]) -> int:
    return int(elem.name[4:elem.name.find('-')])


def linear_interp(lhs, rhs, left_frac: float):
    """
    Linear interpolation between the two given quantities

    Args:
        lhs: Left-hand side interpolant
        rhs: Right-hand side interpolant
        left_frac: Fraction of left hand side that contributes to interpolation

    Returns:
        Interpolated value between lhs and rhs
    """
    left_frac = clamp(left_frac, 0, 1)
    return (lhs * left_frac) + (rhs * (1 - left_frac))
