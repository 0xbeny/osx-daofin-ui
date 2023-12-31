import { useEffect, useMemo, useState } from "react";
import { useClient } from "./useClient";
import { useNetwork } from "../contexts/network";
import { GlobalSettings } from "@xinfin/osx-daofin-sdk-client";
import { ProposalsQuery } from "@xinfin/osx-daofin-sdk-client/dist/internal/graphql-queries/proposals";
import { ethers } from "ethers";
import { getPluginInstallationId } from "../utils/networks";
import { ProposalBase, ProposalMetadata } from "@xinfin/osx-client-common";
import { Proposal } from "../utils/types";
import { SubgraphProposalBase } from "@xinfin/osx-daofin-sdk-client";
import { resolveIpfsCid } from "@xinfin/osx-sdk-common";
const ProposalsQueries = `
query ProposalsQuery($pluginId: ID!) {
  pluginProposals(where: { plugin: $pluginId }) {
    id
    pluginProposalId
    failureMap
    creator
    metadata
    startDate
    endDate
    creationBlockNumber
    snapshotBlock
    executed
    actions {
      id
      to
      value
      data
    }
    dao{
      id
    }
  }
}
`;
function useDaoProposals(
  daoAddress: string,
  pluginAddress: string
): { data: Proposal[]; error: string; isLoading: boolean } {
  const { daofinClient } = useClient();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!daofinClient) return;
    setIsLoading(true);
    daofinClient.graphql
      .request<{ pluginProposals: SubgraphProposalBase[] }>({
        query: ProposalsQueries,
        params: {
          pluginId: getPluginInstallationId(daoAddress, pluginAddress),
        },
      })
      .then(({ pluginProposals }) => {
        return Promise.all(
          pluginProposals.map(async (item) => {
            const metadataCid = resolveIpfsCid(item.metadata);
            const metadataString = await daofinClient.ipfs.fetchString(
              metadataCid
            );
            const metadata = JSON.parse(metadataString) as ProposalMetadata;
            return {
              ...item,
              metadata,
            };
          })
        )
      })
      .then((data) => {

        setProposals(data as unknown as Proposal[]);
      })
      .catch((e) => {
        setIsLoading(false);
        setError(e);
        console.log("error", e);
      });
  }, [daofinClient]);

  return { data: proposals, error: error, isLoading };
}
export default useDaoProposals;
