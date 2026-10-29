export const bookingsQueryKeys = {
  all: ["bookings"] as const,
  byDate: (date: string) => [...bookingsQueryKeys.all, date] as const,
  mutations: () => [...bookingsQueryKeys.all, "mutation"] as const,
};
