export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  image: ShopifyImage | null;
  selectedOptions: { name: string; value: string }[];
};

export type ProductMediaImage = {
  type: "IMAGE";
  image: ShopifyImage;
};

export type ProductMediaVideo = {
  type: "VIDEO";
  previewImage: ShopifyImage | null;
  sources: { url: string; mimeType: string }[];
};

export type ProductMedia = ProductMediaImage | ProductMediaVideo;

export type Product = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  description: string;
  descriptionHtml: string;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  media: ProductMedia[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  variants: ProductVariant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    image: ShopifyImage | null;
    product: {
      handle: string;
      title: string;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
};
