"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { shopifyFetch } from "./client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  GET_CART_QUERY,
} from "./queries";
import type { Cart } from "./types";

const CART_COOKIE = "hlt_cart_id";

async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value;
}

async function setCartId(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId();
  if (!cartId) return null;

  const data = await shopifyFetch<{ cart: Cart | null }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    cache: "no-store",
  });
  return data.cart ?? null;
}

export async function addToCart(variantId: string, quantity = 1) {
  const cartId = await getCartId();

  if (!cartId) {
    const data = await shopifyFetch<{
      cartCreate: { cart: Cart; userErrors: { message: string }[] };
    }>({
      query: CART_CREATE_MUTATION,
      variables: { lines: [{ merchandiseId: variantId, quantity }] },
      cache: "no-store",
    });
    if (data.cartCreate.userErrors.length) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }
    await setCartId(data.cartCreate.cart.id);
  } else {
    const data = await shopifyFetch<{
      cartLinesAdd: { cart: Cart; userErrors: { message: string }[] };
    }>({
      query: CART_LINES_ADD_MUTATION,
      variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
      cache: "no-store",
    });
    if (data.cartLinesAdd.userErrors.length) {
      throw new Error(data.cartLinesAdd.userErrors[0].message);
    }
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function updateCartLine(lineId: string, quantity: number) {
  const cartId = await getCartId();
  if (!cartId) return;

  await shopifyFetch({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    cache: "no-store",
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartLine(lineId: string) {
  const cartId = await getCartId();
  if (!cartId) return;

  await shopifyFetch({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
    cache: "no-store",
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
