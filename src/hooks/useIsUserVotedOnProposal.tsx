import { useEffect, useMemo, useState } from "react";
import { useClient } from "./useClient";
import { useNetwork } from "../contexts/network";
function useIsUserVotedOnProposal(proposalId: string, voterAddress: string) {
  const [isUserVotedOnProposal, setIsUserVotedOnProposal] = useState<boolean>();
  const { daofinClient } = useClient();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!daofinClient) return;
    setIsLoading(true);

    daofinClient.methods
      .isVotedOnProposal(proposalId, voterAddress)
      .then((data) => {
        setIsLoading(false);
        setIsUserVotedOnProposal(data);
      })
      .catch((e) => {
        setIsLoading(false);
        console.log("error", e);
      });
  }, [daofinClient]);
  if (!voterAddress) return false;

  return isUserVotedOnProposal;
}
export default useIsUserVotedOnProposal;
