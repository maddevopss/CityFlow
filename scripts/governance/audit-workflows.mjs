import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const workflowDirectory = '.github/workflows';
const workflowPattern = /\.ya?ml$/;
const immutableActionRefPattern = /^[0-9a-f]{40}$/i;
const changedOnly = process.argv.includes('--changed-only');
const strict = process.argv.includes('--strict');
const baseRef = process.env.WORKFLOW_AUDIT_BASE_REF;

const allWorkflowFiles = fs
  .readdirSync(workflowDirectory)
  .filter(file => workflowPattern.test(file))
  .sort();

function resolveChangedWorkflowFiles() {
  if (!changedOnly) return new Set(allWorkflowFiles);
  if (!baseRef) throw new Error('WORKFLOW_AUDIT_BASE_REF est requis avec --changed-only');

  const output = execFileSync(
    'git',
    ['diff', '--name-only', `${baseRef}...HEAD`, '--', workflowDirectory],
    { encoding: 'utf8' }
  );

  return new Set(
    output
      .split('\n')
      .filter(Boolean)
      .map(file => path.basename(file))
      .filter(file => workflowPattern.test(file))
  );
}

const changedWorkflowFiles = resolveChangedWorkflowFiles();
const findings = [];
const workflowNames = new Map();

for (const file of allWorkflowFiles) {
  const filePath = path.join(workflowDirectory, file);
  const text = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];
  const hasTopLevelPermissions = /^permissions:\s*(?:\n|$)/m.test(text);
  const usesPullRequestTarget = /^\s*pull_request_target\s*:/m.test(text);
  const writePermissions = [...text.matchAll(/^\s+([A-Za-z-]+):\s*write\s*$/gm)].map(match => match[1]);
  const unpinnedActions = [];
  const workflowName = text.match(/^name:\s*(.+)$/m)?.[1]?.trim();

  if (workflowName) {
    const files = workflowNames.get(workflowName) ?? [];
    files.push(file);
    workflowNames.set(workflowName, files);
  }

  for (const match of text.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)) {
    const action = match[1];
    if (action.startsWith('./') || action.startsWith('docker://')) continue;
    const separator = action.lastIndexOf('@');
    const reference = separator >= 0 ? action.slice(separator + 1) : '';
    if (!immutableActionRefPattern.test(reference)) unpinnedActions.push(action);
  }

  if (!hasTopLevelPermissions) errors.push('permissions_top_level_absentes');
  if (usesPullRequestTarget) errors.push('pull_request_target_interdit');
  if (unpinnedActions.length) errors.push('actions_non_epinglees');
  if (writePermissions.length) warnings.push('permissions_write_a_justifier');

  findings.push({
    file,
    changed: changedWorkflowFiles.has(file),
    workflowName,
    hasTopLevelPermissions,
    usesPullRequestTarget,
    writePermissions,
    unpinnedActions,
    errors,
    warnings
  });
}

const duplicateNames = [...workflowNames.entries()]
  .filter(([, files]) => files.length > 1)
  .map(([name, files]) => ({ name, files }));
const strictDuplicateNames = duplicateNames.filter(
  duplicate => !changedOnly || duplicate.files.some(file => changedWorkflowFiles.has(file))
);
const strictFindings = findings.filter(
  finding => (!changedOnly || finding.changed) && finding.errors.length > 0
);

const report = {
  generatedAt: new Date().toISOString(),
  scope: changedOnly ? 'changed-workflows' : 'all-workflows',
  workflowCount: allWorkflowFiles.length,
  changedWorkflowCount: changedWorkflowFiles.size,
  duplicateNames,
  strictDuplicateNames,
  strictFindings,
  findings
};

console.log(JSON.stringify(report, null, 2));

if (strict && (strictFindings.length > 0 || strictDuplicateNames.length > 0)) {
  process.exitCode = 1;
}
