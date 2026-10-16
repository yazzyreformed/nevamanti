export type MenuItem = {
  name: string;
  price: number;
  extraLabel?: string;
  extraPrice?: number;
  desc: string;
  img?: string;
  imgPosition?: string;
  containerClass?: string;
};

export type MenuCategory = {
  category: string;
  id: string;
  items: MenuItem[];
};

export const formatPrice = (price: number) => `${price} TL`;
