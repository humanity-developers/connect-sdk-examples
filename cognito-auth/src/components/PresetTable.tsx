interface PresetResult {
  verified: boolean;
  status: string;
}

interface PresetTableProps {
  presets: string[];
  results: Record<string, PresetResult>;
}

const PRESET_LABELS: Record<string, string> = {
  isHuman: 'Is Human',
  ageOver18: 'Age 18+',
  ageOver21: 'Age 21+',
  kycPassed: 'KYC Passed',
  isAccredited: 'Accredited Investor',
  usResident: 'US Resident',
  notSanctioned: 'Not Sanctioned',
};

export function PresetTable({ presets, results }: PresetTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Preset</th>
          <th>Key</th>
          <th>Status</th>
          <th>Verified</th>
        </tr>
      </thead>
      <tbody>
        {presets.map((preset) => {
          const result = results[preset];
          const verified = result?.verified ?? false;
          const status = result?.status ?? 'unknown';

          return (
            <tr
              key={preset}
              className={`preset-row ${verified ? 'verified' : 'unverified'}`}
            >
              <td>{PRESET_LABELS[preset] ?? preset}</td>
              <td>
                <code style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{preset}</code>
              </td>
              <td>
                <span
                  className={`badge ${
                    status === 'valid'
                      ? 'badge-success'
                      : status === 'error'
                      ? 'badge-error'
                      : 'badge-warning'
                  }`}
                >
                  {status}
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>{verified ? '✅ Yes' : '✗ No'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
