"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { shopifyFetch } from "./client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  GET_CART_QUERY,
} from "./queries";
import type { Cart, CartLine } from "./types";

type RawCart = Omit<Cart, "lines"> & { lines: { nodes: CartLine[] } };

function normalizeCart(raw: RawCart): Cart {
  return {
    ...raw,
    lines: raw.lines.nodes,
  };
}

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

  const data = await shopifyFetch<{ cart: RawCart | null }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    cache: "no-store",
  });
  return data.cart ? normalizeCart(data.cart) : null;
}

export async function addToCart(
  variantId: string,
  quantity = 1,
  attributes?: { key: string; value: string }[]
) {
  const lineAttributes = (attributes ?? []).filter((a) => a.value.trim() !== "");
  const cartId = await getCartId();

  if (!cartId) {
    const data = await shopifyFetch<{
      cartCreate: { cart: RawCart; userErrors: { message: string }[] };
    }>({
      query: CART_CREATE_MUTATION,
      variables: { lines: [{ merchandiseId: variantId, quantity, attributes: lineAttributes }] },
      cache: "no-store",
    });
    if (data.cartCreate.userErrors.length) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }
    await setCartId(data.cartCreate.cart.id);
  } else {
    const data = await shopifyFetch<{
      cartLinesAdd: { cart: RawCart; userErrors: { message: string }[] };
    }>({
      query: CART_LINES_ADD_MUTATION,
      variables: { cartId, lines: [{ merchandiseId: variantId, quantity, attributes: lineAttributes }] },
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

/**
 * Puts a discount code on the visitor's cart so it is already applied when they
 * reach checkout. Creates an empty cart first if they have not started one —
 * a shared discount link is usually the first thing someone clicks, before
 * they have added anything.
 */
export async function applyDiscountCode(code: string): Promise<boolean> {
  let cartId = await getCartId();

  if (!cartId) {
    const created = await shopifyFetch<{
      cartCreate: { cart: RawCart | null };
    }>({
      query: CART_CREATE_MUTATION,
      variables: { lines: [] },
      cache: "no-store",
    });
    cartId = created.cartCreate.cart?.id;
    if (!cartId) return false;
    await setCartId(cartId);
  }

  try {
    const res = await shopifyFetch<{
      cartDiscountCodesUpdate: {
        cart: { discountCodes: { code: string; applicable: boolean }[] } | null;
        userErrors: { message: string }[];
      };
    }>({
      query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
      variables: { cartId, discountCodes: [code] },
      cache: "no-store",
    });

    const codes = res.cartDiscountCodesUpdate.cart?.discountCodes ?? [];
    // Shopify accepts an unknown code and simply marks it inapplicable, so the
    // flag is what decides whether the visitor actually got a discount.
    return codes.some((c) => c.code.toLowerCase() === code.toLowerCase() && c.applicable);
  } catch {
    return false;
  }
}
