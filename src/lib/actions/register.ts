"use server";

import type * as z from "zod";
import bcrypt from "bcryptjs";

import { getUserByEmail } from "../data/user";
import { RegisterSchema } from "@/lib/schemas";
import { db } from "@/server/db";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  // TODO: Send verification token email

  return { success: "User created!" };
};
