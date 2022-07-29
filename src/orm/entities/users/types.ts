export type Role = 'ADMINISTRATOR' | 'STANDARD';
export type Language = 'en-US' | 'sl-SI';

export type incomingUser = {
  id: number;
  cashBalance: number;
  name: string;
  purchaseHistory: [
    {
      dishName: string;
      restaurantName: string;
      transactionAmount: number;
      transactionDate: string;
    },
  ];
};
