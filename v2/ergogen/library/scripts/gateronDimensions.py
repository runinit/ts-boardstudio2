"""Check the bundled KS33 against the Y31 manufacturer package drawing."""
import json
import pathlib
import sys

sys.path.append('/usr/lib/freecad/lib')
import FreeCAD
import Part

ROOT = pathlib.Path(__file__).resolve().parents[1]
MODEL = ROOT / 'vendor/gdek/3d_models/KS33.stp'
NUMERIC_TOLERANCE = 1e-5
PIN_SECTION_Z = 2
POST_SECTION_Z = 3.5
SMALL_DIMENSION_LIMIT = 3
SMALL_DIMENSION_TOLERANCE = 0.2
MEDIUM_DIMENSION_TOLERANCE = 0.3

shape = Part.read(str(MODEL))
assert shape.isValid(), 'Invalid model solid'
bounds = shape.BoundBox
measurements = {}


def check(name, actual, nominal, lower, upper):
    # Use the drawing's dimensional tolerances, not a percentage of model size.
    assert nominal - lower - NUMERIC_TOLERANCE <= actual <= nominal + upper + NUMERIC_TOLERANCE, (name, actual, nominal)
    measurements[name] = actual


# Y31 drawing v5 (2023-09-05): total height 12.15 +0.20/-0 mm.
check('total_height', bounds.ZLength, 12.15, 0, 0.20)
check('body_width', bounds.XLength, 15, 0.4, 0.4)
check('body_depth', bounds.YLength, 15, 0.4, 0.4)

# Resolve the two terminals independently of the model's translated origin.
sections = shape.slice(FreeCAD.Vector(0, 0, 1), PIN_SECTION_Z)
pins = [wire.BoundBox for wire in sections if wire.BoundBox.XLength < 2]
assert len(pins) == 2, 'Expected two switch terminals'
pins.sort(key=lambda box: box.Center.x)
origin = bounds.Center
for name, actual, expected in [
    ('left_pin_x', origin.x - pins[0].Center.x, 4.4),
    ('left_pin_y', origin.y - pins[0].Center.y, 4.7),
    ('right_pin_x', pins[1].Center.x - origin.x, 2.6),
    ('right_pin_y', origin.y - pins[1].Center.y, 5.75),
]:
    tolerance = (SMALL_DIMENSION_TOLERANCE if expected <= SMALL_DIMENSION_LIMIT
                 else MEDIUM_DIMENSION_TOLERANCE)
    check(name, actual, expected, tolerance, tolerance)

# The post section must meet the explicit 5.05 +/-0.05 mm diameter.
sections = shape.slice(FreeCAD.Vector(0, 0, 1), POST_SECTION_Z)
posts = [wire.BoundBox for wire in sections
         if abs(wire.BoundBox.Center.x - origin.x) < NUMERIC_TOLERANCE
         and abs(wire.BoundBox.Center.y - origin.y) < NUMERIC_TOLERANCE]
assert len(posts) == 1, 'Expected one centered mounting post'
check('post_diameter_x', posts[0].XLength, 5.05, 0.05, 0.05)
check('post_diameter_y', posts[0].YLength, 5.05, 0.05, 0.05)
print(json.dumps({'part': 'KS-33H10B050NN-Y31', 'measurements': measurements}, indent=2))
