"use server";

import { hashPassword } from "~/lib/utils";
import { signupSchema, type SignupFormValues } from "~/schemas/authSchemas";
import { db } from "~/server/db";

type SignupResult = {
  success: boolean;
  error?: string;
};

export async function signUp(data: SignupFormValues): Promise<SignupResult> {
  const validatedSchema = signupSchema.safeParse(data);
  if (!validatedSchema.success) {
    return {
      success: false,
      error: validatedSchema.error.issues[0]?.message ?? "Invalid input!",
    };
  }

  const { email, password } = validatedSchema.data;

  try {
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return {
        success: false,
        error: "User already exists!",
      };
    }

    const hashedPassword = await hashPassword(password);

    // const stripe = new Stripe("")
    // const stripeCustomer = await stripe.customers.create({
    //     email: email.toLowerCase()
    // })

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        //stripeCustomerId: stripeCustomer.id
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error occured during signup!",
    };
  }
}
