"""Check physical model terminals against KiCad-exported copper pads."""
import json
import re
import math
import os
import sys

sys.path.append(os.environ.get("FREECAD_LIBDIR", "/usr/lib/freecad/lib"))
import FreeCAD  # Initialize the geometry runtime before importing Part.
import Part

KIND = sys.argv[2]
TERMINAL_VOLUME = 0.05505795 if KIND.startswith("power") else 0.06538
PAD_VOLUME = 0.042 if KIND.startswith("power") else 0.0432
TERMINAL_COUNT = 3 if KIND.startswith("power") else 2
if KIND.startswith("evq7"):
    TERMINAL_VOLUME = 0.07618031
    PAD_VOLUME = 1.4 * 1.05 * 0.04
    TERMINAL_COUNT = 4
if KIND.startswith("smd0805"):
    TERMINAL_VOLUME = 0.02051
    PAD_VOLUME = (1.025 * 1.4 - (4 - math.pi) * 0.25 ** 2) * 0.04
    TERMINAL_COUNT = 2 * int(KIND.split("_")[-1])
VOLUME_TOLERANCE = 0.0001
GEOMETRY_TOLERANCE = 0.00001
MAX_SOLDER_GAP = 0.1
shape = Part.read(sys.argv[1])
if KIND.startswith(("choc_solder", "mx_solder")):
    import pcbnew
    mx = KIND.startswith("mx")
    drill_diameter = 1.4986 if mx else 1.27
    pin_volumes = [14.443849, 7.986316] if mx else [1.802017, 0.959934]
    socket_terminal_volume = 3.829551 if mx else 2.848548
    pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
    pads = [p for fp in pcb.GetFootprints() for p in fp.Pads() if abs(p.GetDrillSize().x / 1e6 - drill_diameter) < GEOMETRY_TOLERANCE]
    pins = [s for s in shape.Solids if min(abs(s.Volume-v) for v in pin_volumes) < VOLUME_TOLERANCE]
    assert len(pins) == 2
    nets = set()
    for pin in pins:
        section = pin.common(Part.makeBox(100,100,1.3,FreeCAD.Vector(-50,-50,0.1)))
        assert section.Volume > 0, "Switch pin does not enter board"
        fits = []
        for pad in pads:
            pos = pad.GetPosition()
            hole = Part.makeCylinder(drill_diameter / 2, 1.6, FreeCAD.Vector(pos.x/1e6, -pos.y/1e6, 0))
            if section.cut(hole).Volume < GEOMETRY_TOLERANCE:
                fits.append(pad)
        assert len(fits) == 1, "Switch solder pin misses its drill"
        nets.add(fits[0].GetNetname())
    assert nets == {"input", "output"}
    assert not any(abs(s.Volume-socket_terminal_volume) < VOLUME_TOLERANCE for s in shape.Solids), "Unexpected socket terminals"
    print(f"{os.path.basename(sys.argv[1])}: both solder pins fit holes and distinct nets; no socket")
    sys.exit(0)
if KIND.startswith(("choc_hotswap", "mx_hotswap")):
    housing_volume = 478.589877 if KIND.startswith("mx") else 497.116426
    pin_volumes = [14.443849, 7.986316] if KIND.startswith("mx") else [1.802017, 0.959934]
    socket_terminal_volume = 3.829551 if KIND.startswith("mx") else 2.848548
    bodies = [s for s in shape.Solids if abs(s.Volume - housing_volume) < VOLUME_TOLERANCE]
    assert len(bodies) == 1, "Expected switch housing"
    # The socket side is opposite the switch's body and keycap side.
    center_z = bodies[0].BoundBox.Center.z
    assert center_z > 1.5 if sys.argv[4] == "B" else center_z < 0, "Switch is on the socket side of the board"
    pins = [s for s in shape.Solids if min(abs(s.Volume-volume) for volume in pin_volumes) < VOLUME_TOLERANCE]
    with open(sys.argv[1].replace(".step", ".json")) as source:
        info = json.load(source)
    holes = [p for p in info["pads"] if p.get("drill") == "(drill 3)"]
    holes = list({tuple(p["at"][:2]): p for p in holes}.values())
    assert len(pins) == 2 and len(holes) >= 2
    for pin in pins:
        section = pin.common(Part.makeBox(100,100,1.3,FreeCAD.Vector(-50,-50,0.1)))
        assert section.Volume > 0, "Switch pin does not enter board"
        section.rotate(FreeCAD.Vector(0,0,0),FreeCAD.Vector(0,0,1),-float(sys.argv[3]))
        b = section.BoundBox
        fits = [p for p in holes if all((x-p["at"][0])**2+(y+p["at"][1])**2 <= 1.5**2 for x in [b.XMin,b.XMax] for y in [b.YMin,b.YMax])]
        assert len(fits) == 1, "Switch pin misses its drill"
    leads = [s for s in shape.Solids if abs(s.Volume-socket_terminal_volume) < VOLUME_TOLERANCE]
    pads = [s for s in shape.Solids if 0 < s.BoundBox.ZLength < 0.05]
    assert len(leads) == 2 and len(pads) >= 2, [(round(s.Volume,6), str(s.BoundBox)) for s in shape.Solids]
    # Check the complete physical path from switch pin through socket to copper.
    contacted = set()
    for pin in pins:
        contacts = [i for i, lead in enumerate(leads) if pin.distToShape(lead)[0] < GEOMETRY_TOLERANCE]
        assert len(contacts) == 1, "Switch pin does not contact exactly one socket terminal"
        contacted.add(contacts[0])
    assert len(contacted) == 2, "Switch pins contact the same socket terminal"
    matched = set()
    for lead in leads:
        fits = []
        for index,pad in enumerate(pads):
            for dz in [-MAX_SOLDER_GAP,0,MAX_SOLDER_GAP]:
                contact = pad.copy()
                contact.translate(FreeCAD.Vector(0,0,dz))
                if lead.common(contact).Volume > GEOMETRY_TOLERANCE:
                    fits.append(index)
                    break
        assert len(fits) == 1, "Socket terminal does not meet one copper pad within solder gap"
        assert fits[0] not in matched
        matched.add(fits[0])
    import pcbnew
    pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
    actual = [p for fp in pcb.GetFootprints() for p in fp.Pads()]
    nets = set()
    for index in matched:
        center = pads[index].BoundBox.Center
        layer = pcbnew.F_Cu if center.z > 0 else pcbnew.B_Cu
        targets = [p for p in actual if p.IsOnLayer(layer)
                   and math.hypot(p.GetPosition().x/1e6-center.x, -p.GetPosition().y/1e6-center.y) < GEOMETRY_TOLERANCE]
        assert len(targets) == 1, "Cannot identify contacted socket copper pad"
        nets.add(targets[0].GetNetname())
    assert nets == {"input", "output"}, "Socket contacts do not bridge the switch nets"
    print(f"{os.path.basename(sys.argv[1])}: switch pins contact distinct socket terminals and input/output copper")
    sys.exit(0)
if KIND.startswith("nice_view"):
    bodies = [s for s in shape.Solids if abs(s.Volume - 499.853557) < VOLUME_TOLERANCE]
    assert len(bodies) == 1, "Expected nice!view board"
    board = bodies[0].copy()
    board.rotate(FreeCAD.Vector(), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
    centers = []
    for face in board.Faces:
        surface = face.Surface
        if isinstance(surface, Part.Cylinder) and abs(surface.Axis.z) > .99:
            centers.append((surface.Center.x, surface.Center.y))
    with open(sys.argv[1].replace(".step", ".json")) as source:
        info = json.load(source)
    pads = [p for p in info["pads"] if p.get("drill") == "(drill 1)"]
    assert len(pads) == 5
    errors = [min(math.hypot(x-p["at"][0],y+p["at"][1]) for x,y in centers) for p in pads]
    assert max(errors) < GEOMETRY_TOLERANCE, f"Display holes miss socket pads: {errors}"
    headers = [s.copy() for s in shape.Solids if abs(s.Volume - 1.998042) < VOLUME_TOLERANCE]
    assert headers, "Expected header pins"
    pin_centers = set()
    for pin in headers:
        pin.rotate(FreeCAD.Vector(), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
        b = pin.BoundBox
        center = (round(b.Center.x, 5), round(b.Center.y, 5))
        pin_centers.add(center)
        assert min(math.hypot(center[0]-p["at"][0],center[1]+p["at"][1]) for p in pads) < .0001, "Header pin misses display/socket row"
        assert b.ZMin < board.BoundBox.ZMin and b.ZMax > board.BoundBox.ZMax, "Header does not pass through display"
    assert len(pin_centers) == 5
    sockets = [s.copy() for s in shape.Solids if abs(s.Volume - 258.204433) < VOLUME_TOLERANCE]
    assert len(sockets) == 1, "Expected five-pin socket"
    socket = sockets[0]
    socket.rotate(FreeCAD.Vector(), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
    section = socket.common(Part.makeBox(100,100,1.3,FreeCAD.Vector(-50,-50,.1)))
    assert len(section.Solids) == 5, "Five socket tails must enter the PCB"
    for tail in section.Solids:
        b = tail.BoundBox
        assert any(all((x-p["at"][0])**2+(y+p["at"][1])**2 < .5**2 for x in [b.XMin,b.XMax] for y in [b.YMin,b.YMax]) for p in pads), "Socket tail misses PCB hole"
    assert socket.common(board).Volume < GEOMETRY_TOLERANCE, "Socket intersects display PCB"
    import pcbnew
    pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
    pcb.BuildConnectivity()
    connectivity = pcb.GetConnectivity()
    def connected(start, target):
        pending, visited = [start], set()
        goal = target.m_Uuid.AsString()
        while pending:
            item = pending.pop()
            identity = item.m_Uuid.AsString()
            if identity == goal:
                return True
            if identity in visited:
                continue
            visited.add(identity)
            pending.extend(connectivity.GetConnectedItems(item))
        return False
    actual = [pad for fp in pcb.GetFootprints() for pad in fp.Pads()]
    expected = ["MOSI", "SCK", "VCC", "GND", "CS"]
    if sys.argv[4] == "B":
        expected.reverse()
    layer = pcbnew.B_Cu if sys.argv[4] == "F" else pcbnew.F_Cu
    if "infused" in KIND:
        layer = pcbnew.F_Cu if sys.argv[4] == "F" else pcbnew.B_Cu
    for index, signal in enumerate(expected):
        hole = next(p for p in actual if p.GetNumber() == str(index+1) and p.GetAttribute() == pcbnew.PAD_ATTRIB_PTH)
        if "_r0_" in KIND or signal == "VCC":
            assert hole.GetNetname() == signal, "Display pin net order differs"
            continue
        local = [p for p in actual if p.GetAttribute() == pcbnew.PAD_ATTRIB_SMD and p.IsOnLayer(layer) and p.GetNetCode() == hole.GetNetCode()]
        assert len(local) == 1, "Expected opposite-side jumper for socket pin"
        # Infused-kim supplies jumper pads for manual routing; ceoloide emits traces.
        if "infused" not in KIND:
            assert connected(hole, local[0]), "Socket trace does not reach jumper"
        position = local[0].GetPosition()
        adjacent = [p for p in actual if p.GetAttribute() == pcbnew.PAD_ATTRIB_SMD and p.IsOnLayer(layer) and p.GetNetname() == signal and math.hypot(p.GetPosition().x-position.x,p.GetPosition().y-position.y) < 1000000]
        assert len(adjacent) == 1, f"Jumper does not connect display pin to {signal}"
    print(f"{os.path.basename(sys.argv[1])}: display/header rows align; socket tails fit; pin/jumper net order matches")
    sys.exit(0)
if KIND.startswith("nano_"):
    bodies = [s for s in shape.Solids if abs(s.Volume - 797.8322594) < VOLUME_TOLERANCE]
    assert len(bodies) == 1, "Expected nice!nano board"
    board = bodies[0]
    chips = [s for s in shape.Solids if abs(s.Volume - 49) < VOLUME_TOLERANCE]
    assert len(chips) == 1, "Expected nice!nano MCU package"
    direction = -1 if sys.argv[4] == "B" else 1
    chip_side = (chips[0].BoundBox.Center.z-board.BoundBox.Center.z)*direction
    assert (chip_side < 0) == ("reverse" in KIND), "MCU faces the wrong side of its module"
    if sys.argv[4] == "B":
        assert board.BoundBox.ZMax <= -5 + GEOMETRY_TOLERANCE, "MCU board lacks socket clearance"
    else:
        assert board.BoundBox.ZMin >= 6.5 - GEOMETRY_TOLERANCE, "MCU board lacks socket clearance"
    local = board.copy()
    local.rotate(FreeCAD.Vector(0,0,0), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
    centers = []
    for face in local.Faces:
        surface = face.Surface
        if isinstance(surface, Part.Cylinder) and abs(surface.Axis.z) > 0.99 and abs(surface.Radius-0.45) < GEOMETRY_TOLERANCE:
            centers.append((surface.Center.x,surface.Center.y))
    with open(sys.argv[1].replace(".step", ".json")) as source:
        info = json.load(source)
    holes = [p for p in info["pads"] if p.get("drill") == "(drill 1)" and abs(abs(p["at"][0])-7.62) < GEOMETRY_TOLERANCE]
    assert len(holes) == 24
    for pad in holes:
        assert min((x-pad["at"][0])**2+(y+pad["at"][1])**2 for x,y in centers) < GEOMETRY_TOLERANCE**2, "MCU socket and module hole centers differ"
    if "infused" in KIND:
        pins = [s.copy() for s in shape.Solids if abs(s.Volume-1.998042) < VOLUME_TOLERANCE]
        assert len(pins) >= 24
        errors = []
        for pin in pins:
            pin.rotate(FreeCAD.Vector(), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
            b = pin.BoundBox
            errors.append(min(math.hypot(b.Center.x-p["at"][0],b.Center.y+p["at"][1]) for p in holes))
        assert max(errors) < .0001, f"Header centers miss MCU/socket holes: {max(errors)} mm"
        sockets = [s.copy() for s in shape.Solids if abs(s.Volume-619.69064) < VOLUME_TOLERANCE]
        assert len(sockets) == 2, "Expected two twelve-pin sockets"
        checked = set()
        for socket in sockets:
            socket.rotate(FreeCAD.Vector(), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
            assert socket.common(local).Volume < GEOMETRY_TOLERANCE, "Socket intersects module PCB"
            section = socket.common(Part.makeBox(100,100,1.3,FreeCAD.Vector(-50,-50,.1)))
            assert len(section.Solids) == 12
            for tail in section.Solids:
                center = tail.BoundBox.Center
                matches = [p for p in holes if math.hypot(center.x-p["at"][0],center.y+p["at"][1]) < GEOMETRY_TOLERANCE]
                assert len(matches) == 1, "Socket tail misses PCB hole center"
                hole = Part.makeCylinder(.5,1.3,FreeCAD.Vector(center.x,center.y,.1))
                assert tail.cut(hole).Volume < GEOMETRY_TOLERANCE, "Socket tail exceeds drill"
                checked.add(tuple(matches[0]["at"][:2]))
        assert len(checked) == 24
        import pcbnew
        pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
        pcb.BuildConnectivity()
        connectivity = pcb.GetConnectivity()
        actual = [p for fp in pcb.GetFootprints() for p in fp.Pads()]
        rows = [("RAW","P1"),("GND","P0"),("RST","GND"),("VCC","GND"),("P21","P2"),("P20","P3"),("P19","P4"),("P18","P5"),("P15","P6"),("P14","P7"),("P16","P8"),("P10","P9")]
        layer = pcbnew.B_Cu if sys.argv[4] == "F" else pcbnew.F_Cu
        for index, signals in enumerate(rows):
            if sys.argv[4] == "B":
                signals = signals[::-1]
            for number, signal in zip([24-index,1+index], signals):
                hole = next(p for p in actual if p.GetNumber() == str(number) and p.GetDrillSize().x == 1000000)
                local_pads = [p for p in actual if p.GetAttribute() == pcbnew.PAD_ATTRIB_SMD and p.IsOnLayer(layer) and p.GetNetCode() == hole.GetNetCode()]
                assert len(local_pads) == 1
                target = local_pads[0]
                pending, visited, reached = [hole], set(), False
                while pending:
                    item = pending.pop()
                    identity = item.m_Uuid.AsString()
                    if identity == target.m_Uuid.AsString():
                        reached = True
                        break
                    if identity in visited:
                        continue
                    visited.add(identity)
                    pending.extend(connectivity.GetConnectedItems(item))
                assert reached, "MCU socket trace misses jumper"
                pos = target.GetPosition()
                signal_pads = [p for p in actual if p.GetAttribute() == pcbnew.PAD_ATTRIB_SMD and p.IsOnLayer(layer) and p.GetNetname() == signal and math.hypot(p.GetPosition().x-pos.x,p.GetPosition().y-pos.y) < 1000000]
                assert len(signal_pads) == 1, f"MCU pin {number} jumper does not map to {signal}"


    print(f"{os.path.basename(sys.argv[1])}: 24 holes align with socket clearance")
    sys.exit(0)
if KIND.startswith("jst"):
    models = [s for s in shape.Solids if abs(s.Volume - 99.495816) < VOLUME_TOLERANCE]
    assert len(models) == 1, "Expected exact JST S2B-PH-K model"
    model = models[0]
    # Inspect straight entry shafts; unloaded retention bends are not rigid-fit gauges.
    z = 0.1 if sys.argv[4] == "B" else 1.39
    section = model.common(Part.makeBox(100, 100, 0.01, FreeCAD.Vector(-50, -50, z)))
    section.rotate(FreeCAD.Vector(0,0,0), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
    assert len(section.Solids) == 2, "Expected two entry shafts"
    with open(sys.argv[1].replace(".step", ".json")) as source:
        info = json.load(source)
    holes = [p for p in info["pads"] if p.get("drill") == "(drill 0.75)"]
    assert len(holes) == 2
    matched = set()
    for pin in section.Solids:
        b = pin.BoundBox
        fits = [p for p in holes if all((x-p["at"][0])**2+(y+p["at"][1])**2 <= 0.375**2+GEOMETRY_TOLERANCE for x in [b.XMin,b.XMax] for y in [b.YMin,b.YMax])]
        assert len(fits) == 1, f"JST entry shaft misses drill: {b}"
        assert fits[0]["index"] not in matched
        matched.add(fits[0]["index"])
    local = model.copy()
    local.rotate(FreeCAD.Vector(0,0,0), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
    b = local.BoundBox
    assert abs(b.XMin+2.95) < GEOMETRY_TOLERANCE and abs(b.XMax-2.95) < GEOMETRY_TOLERANCE
    assert b.ZMin < 0 and b.ZMax > 1.5, "JST pins must span the PCB"
    print(f"{os.path.basename(sys.argv[1])}: both entry shafts fit; housing centered; retention bends not treated as rigid fits")
    sys.exit(0)
if KIND.startswith("reset_"):
    volume = 28.47121 if KIND == "reset_bosses" else 28.24541
    bodies = [s for s in shape.Solids if abs(s.Volume - volume) < VOLUME_TOLERANCE]
    pads = [s for s in shape.Solids if abs(s.Volume - 0.062) < VOLUME_TOLERANCE]
    assert len(bodies) == 1 and len(pads) == 4, "Wrong reset model variant or pad count"
    body = bodies[0]
    for pad in pads:
        contact = body.copy()
        offset = pad.BoundBox.Center.z - (body.BoundBox.ZMax if sys.argv[4] == "B" else body.BoundBox.ZMin)
        if KIND == "reset_bosses":
            offset += 0.5 if sys.argv[4] == "B" else -0.5
        contact.translate(FreeCAD.Vector(0,0,offset))
        assert contact.common(pad).Volume > 0.0001, "Reset contact misses its copper pad"
    if KIND == "reset_bosses":
        section = body.common(Part.makeBox(100,100,1.5,FreeCAD.Vector(-50,-50,0)))
        assert len(section.Solids) == 2, "Expected two locating bosses inside board"
        section.rotate(FreeCAD.Vector(0,0,0), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
        for boss in section.Solids:
            b=boss.BoundBox
            assert abs(b.Center.x) < GEOMETRY_TOLERANCE and abs(abs(b.Center.y)-1.375) < GEOMETRY_TOLERANCE
            assert b.XLength < 0.75 and b.YLength < 0.75, "Reset boss does not fit its NPTH"
    print(f"{os.path.basename(sys.argv[1])}: four contacts align and selected boss variant fits")
    sys.exit(0)
if KIND.startswith("oled"):
    pins = [s for s in shape.Solids if abs(s.Volume - 2.185) < VOLUME_TOLERANCE]
    assert len(pins) == 4, "OLED socket must have four mounting pins"
    with open(sys.argv[1].replace(".step", ".json")) as source:
        info = json.load(source)
    holes = [p for p in info["pads"] if p.get("drill") == "(drill 1)"]
    assert len(holes) == 4, "OLED footprint must have four 1 mm holes"
    matched = set()
    for pin in pins:
        # Inspect the shaft within the PCB, excluding the larger spring contact above it.
        section = pin.common(Part.makeBox(100, 100, 1.5, FreeCAD.Vector(-50, -50, 0)))
        assert section.Volume > 0, "OLED mounting pin does not enter the PCB"
        section.rotate(FreeCAD.Vector(0, 0, 0), FreeCAD.Vector(0, 0, 1), -float(sys.argv[3]))
        bounds = section.BoundBox
        matches = [p for p in holes if all((x - p["at"][0])**2 + (y + p["at"][1])**2 <= 0.5**2 + GEOMETRY_TOLERANCE
                   for x in [bounds.XMin, bounds.XMax] for y in [bounds.YMin, bounds.YMax])]
        assert len(matches) == 1, f"OLED pin does not fit a drill: {bounds}"
        assert matches[0]["index"] not in matched, "Two OLED pins share a drill"
        matched.add(matches[0]["index"])
    print(f"{os.path.basename(sys.argv[1])}: four socket shafts fit their PCB holes")
    sys.exit(0)
if KIND.startswith("trrs_"):
    leads = [s for s in shape.Solids if abs(s.Volume - 0.88423) < VOLUME_TOLERANCE]
    assert len(leads) == 4, "Wrong TRRS lead count"
    with open(sys.argv[1].replace(".step", ".json")) as source:
        info = json.load(source)
    holes = [p for p in info["pads"] if p.get("number") and p.get("drill")]
    matched = set()
    for lead in leads:
        assert lead.BoundBox.ZMin < 0 and lead.BoundBox.ZMax > 1.5, "TRRS lead does not span board"
        local = lead.copy()
        local.rotate(FreeCAD.Vector(0, 0, 0), FreeCAD.Vector(0, 0, 1), -float(sys.argv[3]))
        bounds = local.BoundBox
        matches = []
        for pad in holes:
            drill = [float(v) for v in re.findall(r"[0-9]+(?:\.[0-9]+)?", pad["drill"])]
            width, height = drill[:2]
            radius = width / 2
            straight = (height - width) / 2
            px, py = pad["at"][:2]
            inside = all((x - px)**2 + max(abs(y + py) - straight, 0)**2 <= radius**2 + GEOMETRY_TOLERANCE
                         for x in [bounds.XMin, bounds.XMax] for y in [bounds.YMin, bounds.YMax])
            if inside:
                matches.append(pad)
        assert len(matches) == 1, f"TRRS leg does not fit exactly one drill: {bounds}"
        expected = {3.2: "2", 6.2: "3", 10.2: "4", 11.3: "4" if KIND == "trrs_2" else "5"}
        assert matches[0]["number"] == expected[round(-bounds.Center.y, 1)], "TRRS leg matched the wrong signal"
        assert matches[0]["index"] not in matched, "TRRS legs share a drill"
        matched.add(matches[0]["index"])
    print(f"{os.path.basename(sys.argv[1])}: all four legs fit drilled slots and span the board")
    sys.exit(0)
if KIND.startswith("led_"):
    leads = [s for s in shape.Solids if min(abs(s.Volume - 0.18224), abs(s.Volume - 0.17068)) < VOLUME_TOLERANCE]
    contacts = [s for s in shape.Solids if abs(s.Volume - 0.056) < VOLUME_TOLERANCE]
    assert len(leads) == len(contacts) == 4, "Wrong LED lead/pad count"
    matched = set()
    for lead in leads:
        candidates = []
        for index, pad in enumerate(contacts):
            lower, upper = lead.BoundBox, pad.BoundBox
            gap = max(lower.ZMin - upper.ZMax, upper.ZMin - lower.ZMax, 0)
            projected = lead.copy()
            projected.translate(FreeCAD.Vector(0, 0, upper.Center.z - lower.Center.z))
            if gap <= MAX_SOLDER_GAP and projected.common(pad).Volume > 0.0001:
                candidates.append(index)
        assert len(candidates) == 1, f"LED lead misses copper: {lead.BoundBox}"
        assert candidates[0] not in matched, "Repeated LED pad match"
        matched.add(candidates[0])
        if abs(lead.Volume - 0.17068) < VOLUME_TOLERANCE:
            # The chamfered contact is pin 3 in Keebio's reference footprint.
            y = (0.7 if KIND == "led_reverse" else -0.7) * (-1 if sys.argv[4] == "B" else 1)
            angle = math.radians(float(sys.argv[3]))
            expected = (-2.7 * math.cos(angle) - y * math.sin(angle), -2.7 * math.sin(angle) + y * math.cos(angle))
            center = contacts[candidates[0]].BoundBox.Center
            assert abs(center.x - expected[0]) < GEOMETRY_TOLERANCE and abs(center.y - expected[1]) < GEOMETRY_TOLERANCE, "LED pin 3 misses GND pad"
    print(f"{os.path.basename(sys.argv[1])}: four contacts align; marked pin 3 matches GND")
    sys.exit(0)
if KIND.startswith("molex"):
    count = 5 if KIND.startswith("molex5") else 2
    socket_volume = 15.9490373 if count == 5 else 10.14244
    sockets = [s for s in shape.Solids if abs(s.Volume - socket_volume) < VOLUME_TOLERANCE]
    contacts = [s for s in shape.Solids if abs(s.Volume - 0.0196274) < VOLUME_TOLERANCE]
    contacts = [s for s in contacts if (s.BoundBox.Center.z > 0) == (sys.argv[4] == "F")]
    assert len(sockets) == 1 and len(contacts) == count, [(s.Volume, str(s.BoundBox)) for s in shape.Solids]
    for contact in contacts:
        assert sockets[0].common(contact).Volume > 0.00001, f"Socket misses signal pad: {contact.BoundBox}"
    if KIND.startswith("molex"):
        cable_volume = 25.4056029 if count == 5 else 10.7000774
        # KiCad healing changes this cable volume by about 0.00046 mm3.
        cable_volume_tolerance = 0.001
        cables = [s.copy() for s in shape.Solids if abs(s.Volume-cable_volume) < cable_volume_tolerance]
        assert len(cables) == 1, [(s.Volume,str(s.BoundBox)) for s in shape.Solids]
        cable = cables[0]
        cable.rotate(FreeCAD.Vector(), FreeCAD.Vector(0,0,1), -float(sys.argv[3]))
        wires = cable.common(Part.makeBox(100,.1,100,FreeCAD.Vector(-50,-4.5,-50)))
        assert len(wires.Solids) == count, "Cable is not aligned with the connector exit"
        wire_x = sorted(w.BoundBox.Center.x for w in wires.Solids)
        if sys.argv[4] == "B":
            wire_x.reverse()
        import pcbnew
        pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
        layer = pcbnew.F_Cu if sys.argv[4] == "F" else pcbnew.B_Cu
        signal_pads = [p for fp in pcb.GetFootprints() for p in fp.Pads() if p.IsOnLayer(layer) and p.GetNumber() in [str(i) for i in range(1,count+1)]]
        assert len(signal_pads) == count
        angle = math.radians(float(sys.argv[3]))
        for index, x in enumerate(wire_x, 1):
            pad = next(p for p in signal_pads if p.GetNumber() == str(index))
            position = pad.GetPosition()
            pad_x = (position.x*math.cos(angle)-position.y*math.sin(angle))/1e6
            assert abs(x-pad_x) < GEOMETRY_TOLERANCE, "Cable wire misses its pad column"
            expected_net = f"CONN_{index}" if count == 5 else (["negative","positive"] if KIND == "molex" else ["RAW","GND"])[index-1]
            assert pad.GetNetname() == expected_net, "Connector pin/net mapping differs"
    print(f"{os.path.basename(sys.argv[1])}: {count} connector contacts meet copper; cable columns/net order checked")
    sys.exit(0)
terminals = [s for s in shape.Solids if abs(s.Volume - TERMINAL_VOLUME) < VOLUME_TOLERANCE]
pads = [s for s in shape.Solids if abs(s.Volume - PAD_VOLUME) < VOLUME_TOLERANCE]
if KIND.startswith(("diode", "power", "evq7", "smd0805")):
    pads = [p for p in pads if (p.BoundBox.Center.z > 0) == (sys.argv[4] == "F")]
assert len(terminals) == len(pads) == TERMINAL_COUNT, "Wrong terminal/pad count"
matched = set()
for terminal in terminals:
    lead = terminal.BoundBox
    candidates = []
    for index, pad in enumerate(pads):
        copper = pad.BoundBox
        contained = (copper.XMin - GEOMETRY_TOLERANCE <= lead.XMin
                     and lead.XMax <= copper.XMax + GEOMETRY_TOLERANCE
                     and copper.YMin - GEOMETRY_TOLERANCE <= lead.YMin
                     and lead.YMax <= copper.YMax + GEOMETRY_TOLERANCE)
        gap = max(lead.ZMin - copper.ZMax, copper.ZMin - lead.ZMax, 0)
        if contained and gap <= MAX_SOLDER_GAP:
            candidates.append(index)
    assert len(candidates) == 1, f"Terminal does not match one copper pad: {lead}"
    assert candidates[0] not in matched, "Two terminals matched the same pad"
    matched.add(candidates[0])
if KIND.startswith("smd0805"):
    # Each resistor body must bridge the two nets of one component.
    import pcbnew
    pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
    layer = pcbnew.F_Cu if sys.argv[4] == "F" else pcbnew.B_Cu
    pins = [p for fp in pcb.GetFootprints() for p in fp.Pads() if p.IsOnLayer(layer)]
    bodies = [s for s in shape.Solids if abs(s.Volume - 1.137418048) < VOLUME_TOLERANCE]
    assert len(bodies) == TERMINAL_COUNT // 2
    seen = set()
    for body in bodies:
        center = body.CenterOfMass
        nearest = sorted(pins, key=lambda p: (p.GetPosition().x / 1e6 - center.x) ** 2 + (-p.GetPosition().y / 1e6 - center.y) ** 2)[:2]
        nets = {p.GetNetname() for p in nearest}
        index = next((i for i in range(1, 7) if nets == {f"SMD_{i}_F", f"SMD_{i}_T"}), None)
        assert index is not None and index not in seen, "Resistor does not bridge one distinct net pair"
        seen.add(index)
if KIND.startswith("power_infused"):
    import pcbnew
    pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
    layer = pcbnew.F_Cu if sys.argv[4] == "F" else pcbnew.B_Cu
    first = 1 if sys.argv[4] == "F" else 4
    expected = {str(first): "", str(first+1): "BAT_P", str(first+2): "RAW"}
    pins = [p for fp in pcb.GetFootprints() for p in fp.Pads()
            if p.IsOnLayer(layer) and p.GetNumber() in expected]
    assert len(pins) == 3 and all(p.GetNetname() == expected[p.GetNumber()] for p in pins)
    # The middle physical terminal is the switch common, wired to the battery.
    centers = [t.BoundBox.Center for t in terminals]
    axis = 0 if max(c.x for c in centers)-min(c.x for c in centers) > max(c.y for c in centers)-min(c.y for c in centers) else 1
    center = sorted(centers, key=lambda c: c[axis])[1]
    common = min(pins, key=lambda p: (p.GetPosition().x/1e6-center.x)**2 + (-p.GetPosition().y/1e6-center.y)**2)
    assert common.GetNumber() == str(first+1) and common.GetNetname() == "BAT_P", "Physical common terminal misses battery net"
if KIND.startswith("evq7"):
    # Both legs on each switch contact must retain their authored net.
    import pcbnew
    pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
    pins = [p for fp in pcb.GetFootprints() for p in fp.Pads()]
    assert len(pins) == (8 if KIND.endswith("r1") else 4)
    expected = {"1": "GND", "2": "RST"}
    assert all(p.GetNetname() == expected[p.GetNumber()] for p in pins), "Reset pad/net mapping differs"
if KIND.startswith("diode"):
    # The thin marking solid must stay on the pad-1/cathode end at every rotation.
    stripe = [s for s in shape.Solids if abs(s.Volume - 0.0165) < VOLUME_TOLERANCE]
    assert len(stripe) == 1, "Missing cathode marking"
    angle = math.radians(float(sys.argv[3]))
    center = stripe[0].CenterOfMass
    cathode_projection = -center.x * math.cos(angle) - center.y * math.sin(angle)
    assert 0.8 < cathode_projection < 1.0, "Cathode marking points away from pad 1"
    if "infused" in KIND:
        import pcbnew
        pcb = pcbnew.LoadBoard(sys.argv[1].replace(".step", ".kicad_pcb"))
        expected = {"1": "cathode", "2": "anode"}
        pins = [p for fp in pcb.GetFootprints() for p in fp.Pads()]
        assert len(pins) == (6 if KIND.endswith("_1") else 4)
        assert all(p.GetNetname() == expected[p.GetNumber()] for p in pins), "Diode pad/net polarity differs"

print(f"{os.path.basename(sys.argv[1])}: terminals fit copper pads; polarity checked where applicable")
