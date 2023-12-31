import { useEffect, useMemo, useState } from "react";
import { useClient } from "./useClient";
import { useNetwork } from "../contexts/network";
import { GlobalSettings } from "@xinfin/osx-daofin-sdk-client";
import { ProposalsQuery } from "@xinfin/osx-daofin-sdk-client/dist/internal/graphql-queries/proposals";
import { ethers } from "ethers";
import { formatDate, getPluginInstallationId } from "../utils/networks";
import { ProposalBase, ProposalMetadata } from "@xinfin/osx-client-common";
import { Deposit, Proposal } from "../utils/types";
import { SubgraphProposalBase } from "@xinfin/osx-daofin-sdk-client";
import {
  decodeProposalId,
  encodeProposalId,
  getExtendedProposalId,
  resolveIpfsCid,
} from "@xinfin/osx-sdk-common";
const DepositsQueries = `
query DepositsQueries($pluginId: ID!) {
  pluginDeposits(where: {plugin: $pluginId}) {
    id
    voter
    amount
    snapshotBlock
    txHash
  }
}
`;
function usePeoplesHouseDeposits(pluginId: string): {
  data: Deposit[] | undefined;
  error: string;
  isLoading: boolean;
} {
  const { daofinClient } = useClient();

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!daofinClient || !pluginId) return;
    setIsLoading(true);
    daofinClient.graphql
      .request<{ pluginDeposits: Deposit[] }>({
        query: DepositsQueries,
        params: {
          pluginId: pluginId,
        },
      })
      .then(({ pluginDeposits }) => {
        setDeposits(pluginDeposits as unknown as Deposit[]);
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
        setError(e);
        console.log("error", e);
      });
  }, [daofinClient]);

  return { data: deposits, error: error, isLoading };
}
export default usePeoplesHouseDeposits;
