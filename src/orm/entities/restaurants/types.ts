export type incomingRestaurant = {
  cashBalance: number;
  menu: [
    {
      dishName: string;
      price: number;
    },
  ];
  openingHours: string;
  restaurantName: string;
};
