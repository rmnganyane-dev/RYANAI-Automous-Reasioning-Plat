# Isolated patch verification

`runVerificationPipeline` fails closed unless `RYAN_PATCH_VERIFIER_IMAGE` names an
operator-approved image by `@sha256:<64 lowercase hex characters>`. It never runs
workspace commands on the application host. Provision `/usr/bin/docker`, a local
Docker daemon at `/var/run/docker.sock`, and the image before enabling patching.
The current application deployment does not provision this worker automatically.
Do not mount a Docker socket into validation containers.

The verifier creates a uniquely named container and mounts only the immutable
staging tree at `/input` (read-only), plus an optional read-only test script. It
copies the candidate into disposable `/work` storage, requires the lockfile and
dependency declarations to match the trusted image, copies preinstalled dependencies,
and runs `npm run validate` followed by the optional script. Source directories
must be readable/traversable by UID 65534. Neither dependency installation nor
network access is allowed during validation; dependency updates require an
independently reviewed verifier image rebuild. A candidate may alter its own
validation scripts; sandboxing limits their authority, not their honesty. Keep
independent mandatory checks in the trusted image if required by deployment policy.

The container runs as UID/GID 65534 with no capabilities, no new privileges, no
network, a read-only root filesystem, private IPC, and bounded CPU, memory, PIDs,
output, and runtime. Writable storage is limited to size-bounded tmpfs mounts at
`/work` and `/tmp`. The Docker client uses a fresh empty configuration directory,
a fixed local daemon endpoint and a minimal environment; application credentials,
Docker contexts and credential helpers are not inherited. The image must itself
contain no secrets or sensitive configuration. The image and daemon are trusted
operator infrastructure; Docker shares the host kernel and is not a VM security
boundary. Deploy a dedicated worker host for stronger kernel isolation. Host
processes with application or Docker authority remain trusted.

Container removal is awaited after success, nonzero exit, timeout or CLI failure;
cleanup failure refuses promotion. A hard application kill can leave an isolated
container, but it cannot modify live source. Operators should periodically remove
orphaned `ryan-patch-*` containers after confirming their owners are gone. A Docker
control-plane timeout can race a pending create; reconciliation must also check
for such late-created orphans. Container logs are disabled and failure messages
omit candidate output.

## Provisioning

`docs/patch-verifier.Dockerfile` is a starting image recipe. Build in trusted CI
from the reviewed baseline using a digest-pinned Node image passed as `NODE_IMAGE`.
It installs dependencies with lifecycle scripts disabled. Add reviewed setup for
native modules or generated clients required by your deployment's validation;
never let an incoming patch build its own trusted image. Publish the image,
record its registry digest, preload that exact digest on the worker, and configure
`RYAN_PATCH_VERIFIER_IMAGE` in the application's trusted deployment configuration.
The verifier passes `--pull=never`; a missing image causes rejection.

## Real-worker smoke checks

Unit tests assert the Docker invocation and rejection/cleanup behavior. The opt-in
`src/utils/verifyPatch.docker.test.ts` suite uses the real daemon and configured
approved image to exercise acceptance, rejection, readonly input, host-file and
credential isolation, and network/socket denial. On a provisioned worker, run:

```sh
RYAN_PATCH_DOCKER_TEST=1 npm test -- src/utils/verifyPatch.docker.test.ts
```

Set `RYAN_PATCH_VERIFIER_IMAGE` through trusted worker configuration first. The
suite skips unless explicitly enabled, an image is configured, and `/usr/bin/docker`
exists. It uses this checkout's dependency manifests and changes only the validation
script for the smoke fixture, so the approved image must match those manifests.
It does not build or pull an image. Before production enablement, also run these checks on the intended worker with its approved
image, using disposable staged copies with matching dependency manifests:

1. A successful `npm run validate` accepts the staged copy; a nonzero exit rejects it.
2. An optional script attempting to write `/input/package.json` or a host path
   cannot change either; source hashes remain unchanged.
3. A script cannot see an application-secret environment sentinel, access the
   Docker socket, or open an external network connection.
4. A looping script times out, leaves no running `ryan-patch-*` container, and
   cannot promote its candidate. Simulate daemon cleanup failure and confirm
   promotion remains refused.
5. Alter a dependency declaration or lockfile and confirm rejection until the
   independently reviewed matching image is provisioned.

These real-worker checks require Docker and are not claimed by mocked unit tests.
