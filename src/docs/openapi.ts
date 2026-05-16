export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Notes App Backend APIs",
    version: "1.0.0",
    description:
      "REST APIs for user authentication, personal notes, note sharing, archive, and search."
  },
  paths: {
    "/register": {
      post: {
        summary: "Register a new user",
        requestBody: { $ref: "#/components/requestBodies/AuthBody" },
        responses: {
          "201": { description: "User registered successfully" },
          "409": { description: "Email is already registered" }
        }
      }
    },
    "/login": {
      post: {
        summary: "Login and receive a JWT access token",
        requestBody: { $ref: "#/components/requestBodies/AuthBody" },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { access_token: { type: "string" } }
                }
              }
            }
          },
          "401": { description: "Invalid email or password" }
        }
      }
    },
    "/notes": {
      get: {
        summary: "Get notes accessible to the authenticated user",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/Limit" },
          { $ref: "#/components/parameters/Archived" }
        ],
        responses: {
          "200": {
            description: "List of notes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Note" }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create a note",
        security: [{ bearerAuth: [] }],
        requestBody: { $ref: "#/components/requestBodies/NoteBody" },
        responses: {
          "201": {
            description: "Created note",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Note" }
              }
            }
          }
        }
      }
    },
    "/notes/{id}": {
      get: {
        summary: "Get one accessible note",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/NoteId" }],
        responses: {
          "200": {
            description: "Note data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Note" }
              }
            }
          },
          "404": { description: "Note not found" }
        }
      },
      put: {
        summary: "Update an owned note",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/NoteId" }],
        requestBody: { $ref: "#/components/requestBodies/NoteBody" },
        responses: {
          "200": { description: "Updated note" },
          "403": { description: "Only owner can update" }
        }
      },
      delete: {
        summary: "Delete an owned note",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/NoteId" }],
        responses: {
          "204": { description: "Deleted successfully" },
          "403": { description: "Only owner can delete" }
        }
      }
    },
    "/notes/{id}/share": {
      post: {
        summary: "Share an owned note with another user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/NoteId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["share_with_email"],
                properties: { share_with_email: { type: "string", format: "email" } }
              }
            }
          }
        },
        responses: {
          "200": { description: "Note shared successfully" },
          "403": { description: "Only owner can share" }
        }
      }
    },
    "/notes/{id}/archive": {
      patch: {
        summary: "Archive an owned note",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/NoteId" }],
        responses: { "200": { description: "Archived note" } }
      }
    },
    "/notes/{id}/unarchive": {
      patch: {
        summary: "Unarchive an owned note",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/NoteId" }],
        responses: { "200": { description: "Unarchived note" } }
      }
    },
    "/search": {
      get: {
        summary: "Search accessible notes by title or content",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } },
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/Limit" },
          { $ref: "#/components/parameters/Archived" }
        ],
        responses: { "200": { description: "Search results" } }
      }
    },
    "/about": {
      get: {
        summary: "Candidate and feature information",
        responses: { "200": { description: "About response" } }
      }
    },
    "/openapi.json": {
      get: {
        summary: "OpenAPI document",
        responses: { "200": { description: "OpenAPI JSON" } }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    parameters: {
      NoteId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" }
      },
      Page: {
        name: "page",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, default: 1 }
      },
      Limit: {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }
      },
      Archived: {
        name: "archived",
        in: "query",
        required: false,
        schema: { type: "boolean" }
      }
    },
    requestBodies: {
      AuthBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 }
              }
            }
          }
        }
      },
      NoteBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "content"],
              properties: {
                title: { type: "string", maxLength: 160 },
                content: { type: "string", maxLength: 10000 }
              }
            }
          }
        }
      }
    },
    schemas: {
      Note: {
        type: "object",
        required: ["id", "title", "content", "created_at", "updated_at"],
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          content: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          owner_id: { type: "string", format: "uuid" },
          is_archived: { type: "boolean" },
          access: { type: "string", enum: ["owner", "shared"] }
        }
      }
    }
  }
};
