// lib/actions.ts

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { sql } from "@vercel/postgres"

const BirthdaySchema = z.object({
  id: z.string(),
  name: z.string({
    required_error: "Name is required.",
  }),
  birthdate: z.string({
    required_error: "Birthdate is required.",
  }),
})

const CreateBirthday = BirthdaySchema.omit({ id: true })
const UpdateBirthday = BirthdaySchema.omit({})

export type State = {
  errors?: {
    name?: string[]
    birthdate?: string[]
  }
  message?: string | null
}

export async function createBirthday(prevState: State, formData: FormData) {
  const validatedFields = CreateBirthday.safeParse({
    name: formData.get("name"),
    birthdate: formData.get("birthdate"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Birthday.",
    }
  }

  const { name, birthdate } = validatedFields.data

  try {
    await sql`
      INSERT INTO birthdays (name, birthdate)
      VALUES (${name}, ${birthdate})
    `
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Birthday.",
    }
  }

  revalidatePath("/birthdays")
  redirect("/birthdays")
}

export async function updateBirthday(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateBirthday.safeParse({
    id: id,
    name: formData.get("name"),
    birthdate: formData.get("birthdate"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Birthday.",
    }
  }

  const { name, birthdate } = validatedFields.data

  try {
    await sql`
      UPDATE birthdays
      SET name = ${name}, birthdate = ${birthdate}
      WHERE id = ${id}
    `
  } catch (error) {
    return {
      message: "Database Error: Failed to Update Birthday.",
    }
  }

  revalidatePath("/birthdays")
  redirect("/birthdays")
}

export async function deleteBirthday(id: string) {
  try {
    await sql`DELETE FROM birthdays WHERE id = ${id}`
    revalidatePath("/birthdays")
    return { message: "Deleted Birthday." }
  } catch (error) {
    return { message: "Database Error: Failed to Delete Birthday." }
  }
}
