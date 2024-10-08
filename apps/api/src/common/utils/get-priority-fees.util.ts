import { Rpc } from "@lightprotocol/stateless.js";

export const getPriorityFees = async (rpc: Rpc) => {
  try {
    const rpcEndpoint = rpc.rpcEndpoint;

    const response = (await (
      await fetch(rpcEndpoint, {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getPriorityFeeEstimate",
          params: [
            {
              accountKeys: ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],
              options: {
                includeAllPriorityFeeLevels: true,
              },
            },
          ],
        }),
      })
    ).json()) as {
      result: {
        priorityFeeLevels: {
          min: number;
          low: number;
          medium: number;
          high: number;
          veryHigh: number;
          max: number;
        };
      };
    };

    return response.result.priorityFeeLevels;
  } catch {
    return {
      min: 10_000,
      low: 10_000,
      medium: 10_000,
      high: 10_000,
      veryHigh: 10_000,
      max: 10_000,
    };
  }
};
