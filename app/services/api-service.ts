import { Logger } from '../utils/logger';
import { loadData } from '../utils/save-data';
import { WorkspaceManageService } from './workspace-manage-service';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors'

export class ApiService {
  workspaceManageServiceInstance: WorkspaceManageService | null = null;

  private server: FastifyInstance = Fastify({});

  private port = loadData('configData.app-config').apiPort;

  constructor() {
    this.server.get('/workspaces', async (request, reply) => {
      return this.workspaceManageServiceInstance?.getWorkspaceManagerInfo();
    });

    this.server.post('/workspaces/switch', async (request, reply) => {
      const { workspaceId } = request.body as { workspaceId: string };
      return this.workspaceManageServiceInstance?.switchWorkspace(workspaceId);
    });

    this.start();
  }

  private start = async () => {
    try {
      await this.server.register(cors)
      await this.server.listen({ port: this.port });

      const address = this.server.server.address();
      const port = typeof address === 'string' ? address : address?.port;
      Logger.debug(`Server listening on ${address}:${port}`);
    } catch (err) {
      this.server.log.error(err);
      Logger.error('Fastify initial error', err);
      process.exit(1);
    }
  };

  beforeQuit() {
    this.server.close();
  }

  updateWorkspaceManageService(workspaceManageService: WorkspaceManageService) {
    this.workspaceManageServiceInstance = workspaceManageService;
  }
}
