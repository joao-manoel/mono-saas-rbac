import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from '@saas/env'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handler'
import { authenticateWithGithub } from './routes/auth/authenticate-with-github'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { requestPasswordRecover } from './routes/auth/request-password-recover'
import { resetPassword } from './routes/auth/reset-password'
import { getOrganizationBilling } from './routes/billing/get-organization-billing'
import { createOrganization } from './routes/orgs/create-organization'
import { getMembership } from './routes/orgs/get-membership'
import { getOrganization } from './routes/orgs/get-organization'
import { getOrganizations } from './routes/orgs/get-organizations'
import { acceptInvite } from './routes/orgs/invites/accept-invite'
import { createInvite } from './routes/orgs/invites/create-invite'
import { getInvite } from './routes/orgs/invites/get-invite'
import { getInvites } from './routes/orgs/invites/get-invites'
import { getPendingInvites } from './routes/orgs/invites/get-pending-invites'
import { rejectInvite } from './routes/orgs/invites/reject-invite'
import { revokeInvite } from './routes/orgs/invites/revoke-invite'
import { getMembers } from './routes/orgs/members/get-members'
import { removeMember } from './routes/orgs/members/remove-members'
import { updateMember } from './routes/orgs/members/update-member'
import { createProject } from './routes/orgs/projects/create-project'
import { deleteProject } from './routes/orgs/projects/delete-project'
import { getProject } from './routes/orgs/projects/get-project'
import { getProjects } from './routes/orgs/projects/get-projects'
import { updateProject } from './routes/orgs/projects/update-project'
import { shutdownOrganization } from './routes/orgs/shutdown-organization'
import { transferOrganization } from './routes/orgs/transfer-organization'
import { updateOrganization } from './routes/orgs/update-organization'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js SaaS',
      description: 'Full-stack SaaS with multi-tenant & RBAC.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
app.register(fastifyCors)

// AUTH
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)
app.register(authenticateWithGithub)

// ORGANIZATIONS
app.register(createOrganization)
app.register(getMembership)
app.register(getOrganization)
app.register(getOrganizations)
app.register(updateOrganization)
app.register(shutdownOrganization)
app.register(transferOrganization)

// PROJECTS
app.register(createProject)
app.register(deleteProject)
app.register(getProject)
app.register(getProjects)
app.register(updateProject)

// MEMBERS
app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

// INVITES
app.register(createInvite)
app.register(getInvite)
app.register(getInvites)
app.register(acceptInvite)
app.register(rejectInvite)
app.register(revokeInvite)
app.register(getPendingInvites)

// BILLING
app.register(getOrganizationBilling)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log(`HTTP server running! http://localhost:${env.SERVER_PORT}/`)
})
