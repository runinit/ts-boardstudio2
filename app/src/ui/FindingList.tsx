import type { Finding, MechanicalAssembly, ProjectDoc } from '../../../contracts/src/index';
import { findingTarget, presentedFindings } from './findings';

export function FindingList({ findings, document, assembly, onShow }: { findings: Finding[]; document: ProjectDoc; assembly?: MechanicalAssembly; onShow: (finding: Finding) => void }) {
  const items = presentedFindings(findings, document);
  if (!items.length) return <p className="wb-no-findings">No active findings</p>;
  const groups = new Map<string, Finding[]>();
  for (const finding of items) {
    const target = findingTarget(finding, document, assembly);
    const label = target.label ?? `${finding.scope[0].toUpperCase()}${finding.scope.slice(1)} review`;
    groups.set(label, [...(groups.get(label) ?? []), finding]);
  }
  return <div className="wb-finding-groups">{[...groups].map(([label, entries]) => <section key={label} aria-label={label}>
    <h3>{label}</h3><ul className="wb-findings">{entries.map((finding) => {
      const target = findingTarget(finding, document, assembly);
      const fitted = finding.id.endsWith('outline:corners:fitted');
      return <li key={finding.id} className={`is-${finding.severity}`}>
        <span className="wb-finding-mark" aria-hidden="true" /><div>
          <strong className="wb-finding-severity">{finding.severity === 'info' ? 'Information' : finding.severity === 'error' ? 'Error' : 'Warning'}</strong>
          <p>{finding.message}</p>
          {fitted && <p>The resulting outline has smaller corners than requested. Review the corner size and nearby spacing.</p>}
          {target.label && <button className="wb-secondary" onClick={() => onShow(finding)}>{target.outline ? 'Show outline' : 'Select affected geometry'}</button>}
        </div>
      </li>;
    })}</ul>
  </section>)}</div>;
}
