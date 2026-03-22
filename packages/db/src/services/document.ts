import { SQL, and, asc, count, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { join, resolve } from "node:path";

import type {
  DocumentDataTableRequestSchema,
  DocumentDataTableResponseSchema,
  DocumentUploadSchema,
} from "@digisign/types";

import { db } from "..";
import { directoryExists } from "../libs/directory";
import { InternalError, NotFoundError, ValidationError } from "../libs/errors";
import { lowerSql } from "../libs/parse";
import { generateId } from "../libs/random";
import { OfficeSignature } from "../libs/signature/office";
import { PdfSignature } from "../libs/signature/pdf";
import { convertToSlug, parseSlug } from "../libs/slug";
import { documentTable, signatureTable } from "../tables";

export class DocumentService {
  static async uploadDocument(form: DocumentUploadSchema, userId: string | undefined) {
    if (!userId) {
      throw new InternalError("Invalid user ID");
    }

    const rawBuffer = Buffer.from(await form.file.arrayBuffer());
    const extension = path.extname(form.file.name).toLowerCase();

    let documentHash = "";

    switch (extension) {
      case ".pdf":
        documentHash = await PdfSignature.calculateOriginalHash(rawBuffer);
        break;
      case ".docx":
      case ".xlsx":
        documentHash = await OfficeSignature.calculateOriginalHash(rawBuffer);
        break;
      default:
        throw new ValidationError(`Unsupported file extension: ${extension}`);
    }

    const storagePath = resolve(process.cwd(), "../../storage/documents");

    const documentId = generateId();
    const cleanTitleSlug = convertToSlug(form.title);
    const titleName = convertToSlug(`${cleanTitleSlug}-${documentId}`);

    const existedDir = convertToSlug(`${cleanTitleSlug}-${userId}`);
    const matchedDir = directoryExists(storagePath, existedDir);

    let matchedTitle: string | undefined;
    let matchedDocumentId: string | undefined;

    if (matchedDir) {
      const parsedMatched = parseSlug(matchedDir);
      matchedTitle = parsedMatched.title;
      matchedDocumentId = parsedMatched.id;
    }

    if (matchedDocumentId && matchedTitle) {
      await db
        .delete(documentTable)
        .where(
          and(eq(documentTable.id, matchedDocumentId), eq(lowerSql(documentTable.title), matchedTitle.toLowerCase())),
        );
    }

    const uploadDocument = await db.insert(documentTable).values({
      id: documentId,
      userId,
      fileName: form.file.name,
      hash: documentHash,
      title: form.title,
      description: form.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!uploadDocument) {
      throw new InternalError("Failed to upload document");
    }

    if (matchedDir) {
      rmSync(join(storagePath, matchedDir), {
        recursive: true,
        force: true,
      });
    }

    const targetFolder = join(storagePath, titleName);
    const targetFile = join(targetFolder, form.file.name);

    mkdirSync(targetFolder, { recursive: true });

    await Bun.write(targetFile, form.file);

    return {
      title: form.title,
      description: form.description,
    };
  }

  static async getDocumentDataTable(
    params: DocumentDataTableRequestSchema,
    userId: string,
  ): Promise<DocumentDataTableResponseSchema> {
    try {
      const offset = (params.page - 1) * params.perPage;

      // Build where conditions
      const whereConditions = [eq(documentTable.userId, userId)];

      // Add title filter
      if (params.title) {
        whereConditions.push(ilike(documentTable.title, `%${params.title}%`));
      }

      // Add created_at date range filter
      if (params.createdAt.length > 0) {
        if (params.createdAt[0]) {
          const startDate = new Date(params.createdAt[0]);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(gte(documentTable.createdAt, startDate));
        }

        if (params.createdAt[1]) {
          const endDate = new Date(params.createdAt[1]);
          endDate.setHours(23, 59, 59, 999);
          whereConditions.push(lte(documentTable.createdAt, endDate));
        }
      }

      // Add updated_at date range filter
      if (params.updatedAt.length > 0) {
        if (params.updatedAt[0]) {
          const startDate = new Date(params.updatedAt[0]);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(gte(documentTable.updatedAt, startDate));
        }

        if (params.updatedAt[1]) {
          const endDate = new Date(params.updatedAt[1]);
          endDate.setHours(23, 59, 59, 999);
          whereConditions.push(lte(documentTable.updatedAt, endDate));
        }
      }

      if (params.signedAt.length > 0 && (params.signedAt[0] || params.signedAt[1])) {
        const signedAtConditions: SQL[] = [];

        if (params.signedAt[0]) {
          const startDate = new Date(params.signedAt[0]);
          startDate.setHours(0, 0, 0, 0);
          signedAtConditions.push(gte(signatureTable.signedAt, startDate));
        }

        if (params.signedAt[1]) {
          const endDate = new Date(params.signedAt[1]);
          endDate.setHours(23, 59, 59, 999);
          signedAtConditions.push(lte(signatureTable.signedAt, endDate));
        }

        if (signedAtConditions.length > 0) {
          const signedAtCondition = and(...signedAtConditions);
          if (signedAtCondition) {
            whereConditions.push(signedAtCondition);
          }
        }
      }

      const where = and(...whereConditions);

      // Build order by
      const orderBy =
        params.sort.length > 0
          ? params.sort.map((item) => {
              // Tentukan kolom berdasarkan ID sort
              const column = item.id === "signedAt" ? signatureTable.signedAt : documentTable[item.id];

              return item.desc ? desc(column) : asc(column);
            })
          : [desc(documentTable.createdAt)]; // Default sort by created_at desc

      // Execute transaction to get both data and count
      const result = await db.transaction(async (ctx) => {
        const data = await ctx
          .selectDistinct({
            id: documentTable.id,
            userId: documentTable.userId,
            hash: documentTable.hash,
            fileName: documentTable.fileName,
            title: documentTable.title,
            description: documentTable.description,
            createdAt: documentTable.createdAt,
            updatedAt: documentTable.updatedAt,
            signedAt: signatureTable.signedAt,
          })
          .from(documentTable)
          .leftJoin(signatureTable, eq(signatureTable.documentId, documentTable.id))
          .where(where)
          .orderBy(...orderBy)
          .limit(params.perPage)
          .offset(offset);

        const totalResult = await ctx
          .select({ count: count(documentTable.id) })
          .from(documentTable)
          .leftJoin(signatureTable, eq(signatureTable.documentId, documentTable.id))
          .where(where);

        const total = totalResult[0]?.count ?? 0;

        return { data, total };
      });

      const pageCount = Math.ceil(result.total / params.perPage);

      return {
        data: result.data,
        pageCount,
        total: result.total,
        page: params.page,
        perPage: params.perPage,
      };
    } catch (error) {
      console.error("Error fetching document datalist:", error);
      throw new InternalError("Failed to fetch document datalist");
    }
  }

  static async getDocumentById(id: string) {
    const { id: documentId } = parseSlug(id);

    if (!documentId) {
      throw new InternalError("Invalid document ID");
    }

    const documentData = await db.query.documentTable.findFirst({
      with: {
        user: true,
        signature: true,
      },
      where: (documentTable, { eq }) => eq(documentTable.id, documentId),
    });

    if (!documentData) {
      throw new InternalError("Document not found");
    }

    return { ...documentData };
  }

  static async deleteDocumentById(id: string) {
    const { id: documentId, title } = parseSlug(id);

    if (!documentId) {
      throw new InternalError("Invalid document ID");
    }

    const documentPath = join("public", "documents");

    const documentDir = convertToSlug(`${title}-${documentId}`);

    const checkDocument = await db.query.documentTable.findFirst({
      where: (documentTable, { eq }) => eq(lowerSql(documentTable.id), documentId),
    });
    if (!checkDocument) {
      throw new NotFoundError("Document not found");
    }

    const deleteData = await db.delete(documentTable).where(eq(documentTable.id, checkDocument.id)).returning();
    if (!deleteData) {
      throw new NotFoundError("Document not found");
    }

    if (deleteData) {
      rmSync(join(documentPath, documentDir), {
        recursive: true,
        force: true,
      });
    }
  }

  static async getAllDocuments(userId: string) {
    const documents = await db.query.documentTable.findMany({
      columns: {
        id: true,
        userId: true,
        fileName: true,
        title: true,
        hash: true,
      },
      where: (documentTable, { eq }) => eq(documentTable.userId, userId),
    });

    return documents;
  }
}
