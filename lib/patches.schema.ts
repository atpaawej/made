import { z } from "zod";

const updateSiteSchema = z.object({
  op: z.literal("update_site"),
  patch: z
    .object({
      businessName: z.string().min(1).max(80).optional(),
      city: z.string().min(1).max(40).optional(),
      whatsapp: z
        .string()
        .regex(/^\d{8,15}$/, "whatsapp must be digits 8-15")
        .optional(),
      callNumber: z
        .string()
        .regex(/^\d{8,15}$/, "callNumber must be digits 8-15")
        .optional(),
    })
    .strict()
    .refine((o) => Object.keys(o).length > 0, { message: "patch empty" }),
});

const updateSectionSchema = z.object({
  op: z.literal("update_section"),
  id: z.string().min(1).max(64),
  patch: z.record(z.unknown()),
});

const updateCardSchema = z.object({
  op: z.literal("update_card"),
  sectionId: z.string().min(1).max(64),
  cardId: z.string().min(1).max(64),
  patch: z.record(z.unknown()),
});

const addCardSchema = z.object({
  op: z.literal("add_card"),
  sectionId: z.string().min(1).max(64),
  card: z.object({
    title: z.string().min(1).max(80),
    desc: z.string().max(300).optional(),
    price: z.string().max(30).optional(),
    image: z.string().max(500).optional(),
  }),
});

const deleteCardSchema = z.object({
  op: z.literal("delete_card"),
  sectionId: z.string().min(1).max(64),
  cardId: z.string().min(1).max(64),
});

export const patchOpSchema = z.discriminatedUnion("op", [
  updateSiteSchema,
  updateSectionSchema,
  updateCardSchema,
  addCardSchema,
  deleteCardSchema,
]);

export const patchesSchema = z.array(patchOpSchema).max(20);

export type PatchOpParsed = z.infer<typeof patchOpSchema>;
