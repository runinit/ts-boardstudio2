import type { MechanicalAssembly, MechanicalConfiguration } from '@boardstudio/v2-contracts';

/** Record explicit fit allowances so a CAM operator does not apply them twice. */
export function mechanicalFabricationNotes(config: MechanicalConfiguration, assembly: MechanicalAssembly): string {
  const mounts = assembly.case.bodies.find(body => body.body.id === 'plate')?.body.mounts ?? [];
  return `# Mechanical fabrication specification

Revision: ${assembly.revision}
Process: ${config.method}
Mount system: ${config.mount}
Plate finished thickness: ${config.plateThickness} mm
PCB nominal thickness: ${config.pcbThickness} mm
Plate-to-PCB distance: ${assembly.stack.find(layer => layer.id === 'plate')?.z ?? config.plateToPcb} mm
Plate foam thickness: ${config.plateFoamThickness} mm
Bottom foam thickness: ${config.bottomFoamThickness} mm
Wall thickness: ${config.wallThickness} mm

The assembled STEP includes a nominal, unpopulated PCB reference. Component solids are not included. This reference is excluded from manufacturing part exports.

## Material and hardware

${config.method === 'pcb-fr4' ? 'Plate substrate: FR4, no copper or plated holes. Confirm grade, finish and thickness tolerance with the fabricator.' : 'Material grade, finish and mechanical properties must be selected with the fabricator; no material grade is inferred from the process choice.'}
Plate mounting holes: ${mounts.length ? mounts.map(mount => `${mount.id}: diameter ${mount.holeDiameter} mm at (${mount.at.x}, ${mount.at.y}) mm`).join('; ') : 'none'}.
Hardware specifications (metadata only; threads are not modeled):
${config.hardware?.map(item => `- ${item.id}: ${item.quantity} × ${item.designation}; thread ${item.thread}; length ${item.length} mm; part ${item.partId}, mount ${item.featureId}${item.tolerance ? `; tolerance ${item.tolerance}` : ''}${item.notes ? `; ${item.notes}` : ''}`).join('\n') || '- No hardware specifications recorded.'}
Fastener compatibility, washers, inserts, torque, gasket material and adhesive specifications are not inferred from hole diameter. Review recorded hardware against the assembled stack before ordering.

Per-part process specifications:
${config.partProcesses?.map(part => `- ${part.partId}: ${part.method}; material ${part.material}; finished thickness ${part.thickness} mm; constraint set ${part.constraintsVersion}`).join('\n') || '- No per-part overrides.'}

## Critical fit and process allowances

Plate STEP, STL, SVG, DXF and KiCad geometry uses the same resolved millimetre design. Explicit radial opening allowance: ${config.openingAllowance ?? 0} mm. Foam retains nominal exclusions. No automatic shrinkage, kerf or tool-radius compensation has been applied. Account for the recorded opening allowance before applying any additional reviewed CAM compensation; preserve the nominal source. CNC internal corners require a compatible tool radius or explicitly reviewed relief. Printed shrinkage and cut-sheet kerf require a measured process coupon. Critical interfaces: switch retention, stabilizer cutouts, plate-to-PCB distance, fastener fit and battery clearance. Confirm each before fabrication.

Recorded critical dimensions:
${config.criticalFits?.map(fit => `- ${fit.id}: ${fit.partId} — ${fit.label}: ${Math.hypot(fit.to.x - fit.from.x, fit.to.y - fit.from.y).toFixed(3)} mm, ${fit.tolerance}; from (${fit.from.x}, ${fit.from.y}) to (${fit.to.x}, ${fit.to.y}) mm.`).join('\n') || '- No critical dimension annotations recorded.'}

Nominal opening extents (bounding dimensions, not replacement profiles):
${(assembly.nominalPlateContours ?? assembly.plateContours).filter(contour => contour.hole).map((contour, index) => {
  const xs = contour.points.map(point => point.x);
  const ys = contour.points.map(point => point.y);
  return `- Opening ${index + 1}: ${(Math.max(...xs) - Math.min(...xs)).toFixed(3)} × ${(Math.max(...ys) - Math.min(...ys)).toFixed(3)} mm; review the full contour for corner radii and retention tabs.`;
}).join('\n') || '- No profile openings.'}

Profile sources:
${config.profiles.map(profile => `- ${profile.definitionId}: ${profile.source}`).join('\n') || '- No mechanical profiles configured.'}

Diagnostics:
${assembly.diagnostics.map(finding => `- ${finding.severity}: ${finding.message}`).join('\n') || '- No resolver diagnostics.'}
`;
}

const xml = (value: string): string => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[character]!));

export function criticalFitDrawing(assembly: MechanicalAssembly, config?: MechanicalConfiguration): string {
  const contours = assembly.nominalPlateContours ?? assembly.plateContours;
  const fits = config?.criticalFits ?? [];
  const hardware = config?.hardware ?? [];
  const referencedParts = new Set([...fits.map(fit => fit.partId), ...hardware.map(item => item.partId)]);
  const referenceBodies = assembly.case.bodies.filter(entry => entry.body.id !== 'plate' && referencedParts.has(entry.body.id));
  const points = [...contours.flatMap(contour => contour.points), ...fits.flatMap(fit => [fit.from, fit.to]),
    ...referenceBodies.flatMap(entry => entry.contours.flatMap(contour => contour.points))];
  if (!points.length) throw new Error('No plate geometry for critical-fit drawing');
  if (points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) throw new Error('Invalid critical-fit coordinates');
  const minX = Math.min(...points.map(point => point.x));
  const maxX = Math.max(...points.map(point => point.x));
  const minY = Math.min(...points.map(point => point.y));
  const maxY = Math.max(...points.map(point => point.y));
  const width = maxX - minX;
  const height = maxY - minY;
  const paths = contours.map(contour => `<path d="${contour.points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${-point.y}`).join(' ')} Z"/>`).join('');
  const referencePaths = referenceBodies.map(entry => `<g data-part="${xml(entry.body.id)}" fill="none" stroke="#8c959b" stroke-width="0.1" stroke-dasharray="0.7 0.5">${entry.contours.map(contour => `<path d="${contour.points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${-point.y}`).join(' ')} Z"/>`).join('')}</g>`).join('');
  const holes = (assembly.case.bodies.find(body => body.body.id === 'plate')?.body.mounts ?? []).map(mount => `<circle cx="${mount.at.x}" cy="${-mount.at.y}" r="${mount.holeDiameter / 2}"/>`).join('');
  const dimensions = fits.map(fit => {
    const dx = fit.to.x - fit.from.x;
    const dy = fit.to.y - fit.from.y;
    const length = Math.hypot(dx, dy);
    if (!Number.isFinite(length) || length <= 0) throw new Error('Critical-fit endpoints must be distinct');
    const offset = { x: -dy / length * 5, y: dx / length * 5 };
    const a = { x: fit.from.x + offset.x, y: fit.from.y + offset.y };
    const b = { x: fit.to.x + offset.x, y: fit.to.y + offset.y };
    return `<g data-fit="${xml(fit.id)}"><path d="M ${fit.from.x} ${-fit.from.y} L ${a.x} ${-a.y} M ${fit.to.x} ${-fit.to.y} L ${b.x} ${-b.y}" fill="none" stroke="#42657a" stroke-width="0.12"/><path d="M ${a.x} ${-a.y} L ${b.x} ${-b.y}" fill="none" stroke="#42657a" stroke-width="0.15" marker-start="url(#dimension-arrow)" marker-end="url(#dimension-arrow)"/><text x="${(a.x + b.x) / 2}" y="${-(a.y + b.y) / 2 - 1}" text-anchor="middle" font-family="sans-serif" font-size="2.2" fill="#23495e">${xml(`${fit.partId}: ${fit.label} — ${length.toFixed(3)} mm ${fit.tolerance}`)}</text></g>`;
  }).join('');
  const callouts = hardware.map((item, index) => {
    const body = assembly.case.bodies.find(entry => entry.body.id === item.partId);
    const mount = body?.body.mounts?.find(feature => feature.id === item.featureId);
    if (!mount) throw new Error(`Hardware ${item.id} is not linked to a generated mounting feature`);
    const x = maxX + 12;
    const y = -maxY + index * 9;
    const label = `${item.quantity} × ${item.designation}; ${item.thread} × ${item.length} mm`;
    const feature = `${item.partId}/${item.featureId}${item.tolerance ? `; ${item.tolerance}` : ''}`;
    return `<g data-hardware="${xml(item.id)}"><path d="M ${mount.at.x} ${-mount.at.y} L ${x - 2} ${y}" fill="none" stroke="#705b35" stroke-width="0.12"/><circle cx="${mount.at.x}" cy="${-mount.at.y}" r="0.4" fill="#705b35"/><text x="${x}" y="${y}" font-family="sans-serif" font-size="2.3" fill="#493a21">${xml(label)}<tspan x="${x}" dy="3">${xml(feature)}</tspan></text></g>`;
  }).join('');
  const drawingWidth = width + (hardware.length ? 135 : 40);
  const drawingHeight = Math.max(height + 50, hardware.length * 9 + 40);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${drawingWidth}mm" height="${drawingHeight}mm" viewBox="${minX - 20} ${-maxY - 20} ${drawingWidth} ${drawingHeight}"><defs><marker id="dimension-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#42657a"/></marker></defs>${referencePaths}<g fill="none" stroke="#111" stroke-width="0.15">${paths}${holes}<path d="M ${minX} ${-minY + 5} v 4 M ${maxX} ${-minY + 5} v 4 M ${minX} ${-minY + 7} H ${maxX}"/></g>${dimensions}${callouts}<g font-family="sans-serif" font-size="2.5" fill="#111"><text x="${minX}" y="${-maxY - 10}">NOMINAL ASSEMBLY XY — CRITICAL FIT REVIEW</text><text x="${minX}" y="${-minY + 12}">Extents: ${width.toFixed(3)} × ${height.toFixed(3)} mm</text><text x="${minX}" y="${-minY + 17}">Nominal geometry; see specification for opening allowance.</text><text x="${minX}" y="${-minY + 22}">Hardware callouts are specifications; threads are not modeled.</text><text x="${minX}" y="${-minY + 27}">See FABRICATION.md for fit and hardware specifications.</text></g></svg>`;
}
