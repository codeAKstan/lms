import Mux from "@mux/mux-node";

// Ensure we only instantiate once in development
const globalForMux = globalThis as unknown as {
    mux: Mux | undefined;
};

export const mux = globalForMux.mux ?? new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!
});

if (process.env.NODE_ENV !== "production") globalForMux.mux = mux;
