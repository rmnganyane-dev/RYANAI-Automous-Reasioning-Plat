# Workspace patch ownership and recovery

`self_patch_workspace` now validates a disposable source snapshot before it can
replace a live file. This is a Linux, Git-checkout workflow. It is disabled in
practice until an operator provisions the isolated verifier described in
[patch-verifier.md](patch-verifier.md). There is no in-process or host-shell
fallback when Docker, the approved image, or verification is unavailable.
Production images without Git/source metadata cannot use this workflow.

## Enablement requirements and scope

- Use a dedicated source checkout on a local filesystem that supports atomic
  same-directory rename and file/directory `fsync`. Do not use a shared/network
  filesystem without validating these guarantees.
- All application instances and other writers of that checkout must honor
  `.ryan-patch/lock`, or be stopped while patching is enabled. The directory lock
  spans the entire snapshot/verify/promote operation. Version checks detect
  changes during validation, but cannot prevent a non-cooperating editor from
  writing between the final check and rename. OS access controls must enforce
  the exclusive-writer assumption; this is not protection against a hostile
  same-UID process or host administrator.
- The deployment image, Docker daemon, Git executable, and patch controller are
  trusted operator infrastructure. Incoming patches must not be able to change
  their running configuration. An accepted patch is still executable code:
  sandboxed validation is not a substitute for authorization or code review.
- Only existing Git-tracked regular files are patchable. Additions/deletions,
  symlinks, hard links, conflicted indexes and submodules are unsupported. Use
  the normal reviewed Git workflow for these changes. This restriction prevents
  accepted additions from disappearing from the next tracked-file snapshot.
- The candidate includes tracked working-tree bytes (including tracked local
  edits), not just HEAD. It excludes `.git`, private patch state, dependency
  directories, known credential files/directories, `.env*`, and key containers.
  Untracked/ignored local artifacts and submodule contents are not validated.
  Keep runtime credentials outside tracked source; filename exclusions cannot
  detect arbitrary secrets embedded in source or configuration. Do not enable
  this source-validation workflow for deployments whose behavior depends on
  additional untracked code.
- Files are bounded to 32 MiB, snapshots to 256 MiB and incoming patches to 8 MiB.
  Verification stages are private temporary directories under `/tmp`, outside
  the live checkout. The container receives only the source subdirectory as a
  read-only mount. Neither `.git` nor the private journal enters the worker.
- Dependency manifest/lockfile changes require a separately reviewed matching
  verifier image. See the image provisioning notes before enabling this feature.

## Transaction behavior

1. Atomically create `.ryan-patch/lock`. An overlapping request gets a busy error;
   it cannot delete or steal another request's lock.
2. Persist a private journal and copy tracked source to a separate snapshot.
   Apply the candidate only to that snapshot.
3. Validate in the restricted container; the optional test script runs there too.
   A failure returns `rejected` without writing to live source.
4. Compare the tracked source/index/HEAD revision and target hash again. A change
   returns `conflict` without rollback. MCP reports every non-success as an error.
5. Persist promotion intent, write/fsync a temporary sibling of the target, then
   atomically rename it over the target and fsync the parent directory. Promotion
   uses the original requested bytes, never worker-generated build output.
6. Persist `committed`, remove the private snapshot, and release ownership by
   atomically retiring the lock directory before removing it.

Promotion handles one file per request. A process crash leaves the old or verified
new file, not a partially overwritten file; durability depends on the filesystem's
`fsync` guarantees. There is no snapshot rollback that can overwrite newer work.
A crash before promotion leaves live source untouched. Uncertain I/O failure after
promotion intent deliberately preserves the lock and journal. A cleanup error
returns failure even if the verified patch was already committed; inspect state
before retrying.

## Recovery after interruption

Recovery is operator-only and is not exposed through MCP or agent tools. Never
clear a lock based on age or PID: another instance may still own it.

1. Stop **all** patch controllers, editors, build/watch processes and other writers
   for the checkout. Confirm that no request is still active.
2. Inspect/remove orphan `ryan-patch-*` Docker containers belonging to stopped
   controllers, including containers created after a control-plane timeout.
3. Using a trusted, reviewed copy of the recovery tool and the repository's `tsx`
   runtime, run:

   ```sh
   npx --no-install tsx scripts/recover-workspace-patch.ts --confirm-quiescent /absolute/workspace
   ```

4. Recovery inspects the persisted phase and hashes. Before promotion it abandons
   the candidate. Around promotion, matching old bytes mean `aborted`; matching
   verified bytes mean `committed`. It removes only transaction-owned temporary
   files/snapshots, releases the lock, and never rewrites live source.
5. If neither hash matches, or a journal is corrupt, recovery refuses cleanup.
   Preserve the journal and investigate the conflicting workspace manually.
6. Re-run recovery safely after another interruption, then restart writers.

A crash during lock retirement may leave a `.ryan-patch/finished-*` directory.
After confirming quiescence, it can be removed; it no longer owns the lock.
Orphaned `/tmp/ryan-patch-stage-*` directories are private snapshots and can likewise
be removed only after confirming no live controller/container owns them.

The separate legacy `execute_sandbox_script` tool is unchanged by this patch
workflow. Its working-directory wrapper is not a security sandbox; deployments
requiring general script isolation must disable or separately harden that tool.

## Validation

Regression tests cover live-file immutability before validation, concurrent
requests, failed validation, changes elsewhere in the tracked tree, unsafe paths,
permission preservation, interrupted-promotion recovery, and MCP error reporting.
Child-process tests send SIGKILL during verification and immediately before/after
target rename, then exercise recovery against the real filesystem.
Docker contract tests assert containment and cleanup. The separate opt-in Docker
suite exercises actual containment on a provisioned worker; skipped Docker tests
are not evidence of production isolation.
