import { organizationSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organization/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Shutdown organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', authOrganization)) {
          throw new UnauthorizedError(
            `You're not allowed to shutdown this organization`,
          )
        }

        await prisma.organization.delete({
          where: {
            id: organization.id,
          },
        })

        return reply.status(204).send()
      },
    )
}

/*
{
  "organizations": [
    {
      "id": "4aff109d-3568-4978-8fdf-0a4a0392895c",
      "name": "Acme Inc (Admin)",
      "slug": "acme-admin",
      "avatarUrl": "https://avatars.githubusercontent.com/u/94425376",
      "role": "ADMIN"
    },
    {
      "id": "1a8ae551-b0ff-4502-925a-09285fded301",
      "name": "Acme Inc (Billing)",
      "slug": "acme-billing",
      "avatarUrl": "https://avatars.githubusercontent.com/u/72489131",
      "role": "BILLING"
    },
    {
      "id": "808be07a-91f0-4880-b5e2-3a14e418bbc6",
      "name": "Acme Inc (Member)",
      "slug": "acme-member",
      "avatarUrl": "https://avatars.githubusercontent.com/u/38177607",
      "role": "MEMBER"
    }
  ]
}
*/
