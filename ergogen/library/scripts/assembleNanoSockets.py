"""Position two unchanged KiCad sockets at the nice!nano row spacing."""
import sys
from pathlib import Path
sys.path.insert(0, '/usr/lib/freecad/lib')
import FreeCAD
import Part
ROOT = Path(__file__).resolve().parents[1] / 'vendor/kicad/3d_models'
ROW_HALF_SPACING = 7.62
FIRST_PIN_Y = 12.7
source = Part.read(str(ROOT / 'PinSocket_1x12_P2.54mm_Vertical.step'))
rows = []
for x in [-ROW_HALF_SPACING, ROW_HALF_SPACING]:
    row = source.copy()
    row.translate(FreeCAD.Vector(x, FIRST_PIN_Y, 0))
    rows.append(row)
assembly = Part.makeCompound(rows)
assembly.exportStep(str(ROOT / 'PinSocket_2x12_W15.24mm_Vertical.step'))
# Check actual solid sections, not rectangular bounding-box corners.
for row in rows:
    sections = row.common(Part.makeBox(100, 100, 1, FreeCAD.Vector(-50, -50, -2)))
    assert len(sections.Solids) == 12
    for tail in sections.Solids:
        center = tail.BoundBox.Center
        assert min(abs(center.x-x) for x in [-ROW_HALF_SPACING, ROW_HALF_SPACING]) < 1e-8
        assert min(abs(center.y-(FIRST_PIN_Y-i*2.54)) for i in range(12)) < 1e-8
        hole = Part.makeCylinder(.5, 1, FreeCAD.Vector(center.x, center.y, -2))
        assert tail.cut(hole).Volume < 1e-8
print('24 socket tails align and fit nominal 1 mm holes; housing height', assembly.BoundBox.ZMax)
