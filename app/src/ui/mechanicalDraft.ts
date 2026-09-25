import type { MechanicalConfiguration } from '@boardstudio/v2-contracts';

const signature = (value: unknown): string => JSON.stringify(value, (_key, item: unknown) => {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
  }
  return item;
});

/** Keep queued field edits while earlier whole-configuration commits are acknowledged. */
export class MechanicalDraft {
  value: MechanicalConfiguration | undefined;
  private committed: MechanicalConfiguration | undefined;
  private pending: { value: MechanicalConfiguration | undefined; signature: string }[] = [];

  constructor(configuration?: MechanicalConfiguration, private scope = '', private revision = 0) {
    this.value = this.committed = configuration;
  }

  receive(configuration?: MechanicalConfiguration, scope = this.scope, revision = this.revision): void {
    if (scope !== this.scope) {
      this.scope = scope; this.revision = revision; this.pending = [];
      this.value = this.committed = configuration;
      return;
    }
    if (revision < this.revision) return;
    this.revision = revision;
    if (configuration === this.committed) return;
    const unchanged = signature(configuration ?? null) === signature(this.committed ?? null);
    this.committed = configuration;
    const acknowledged = this.pending.findIndex((entry) => entry.signature === signature(configuration ?? null));
    if (acknowledged < 0) {
      if (unchanged) return;
      // Undo, reopen, or an external edit replaces this editor's local queue.
      this.pending = [];
      this.value = configuration;
      return;
    }
    this.pending.splice(0, acknowledged + 1);
    this.value = this.pending.length ? this.pending[this.pending.length - 1].value : configuration;
  }

  submit(configuration: MechanicalConfiguration | null): void {
    this.value = configuration ?? undefined;
    this.pending.push({ value: this.value, signature: signature(configuration) });
  }
}
