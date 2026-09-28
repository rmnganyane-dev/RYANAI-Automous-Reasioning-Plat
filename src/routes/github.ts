import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GitHubShipper, CommitAndPushOptions, CreatePullRequestOptions, CreateReleaseOptions } from '../services/githubShipper';

const shipper = new GitHubShipper();

export async function githubRoutes(fastify: FastifyInstance) {
  // Direct multi-file commit & shipping route
  fastify.post('/api/v1/github/ship', async (req: FastifyRequest<{ Body: CommitAndPushOptions }>, reply: FastifyReply) => {
    try {
      const payload = req.body;
      const result = await shipper.commitAndPushFiles(payload);

      return reply.send({
        success: true,
        action: 'COMMITTED_AND_PUSHED',
        commitSha: result.commitSha,
        branch: payload.branch,
        filesPushed: payload.files.length,
      });
    } catch (error: any) {
      fastify.log.error(error, 'GitHub ship operation failed');
      return reply.status(500).send({
        error: 'GITHUB_SHIP_FAILED',
        message: error.message,
      });
    }
  });

  // Open PR route
  fastify.post('/api/v1/github/pull-request', async (req: FastifyRequest<{ Body: CreatePullRequestOptions }>, reply: FastifyReply) => {
    try {
      const pr = await shipper.createPullRequest(req.body);
      return reply.send({ success: true, pr });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Tag Release route
  fastify.post('/api/v1/github/release', async (req: FastifyRequest<{ Body: CreateReleaseOptions }>, reply: FastifyReply) => {
    try {
      const release = await shipper.createRelease(req.body);
      return reply.send({ success: true, release });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}