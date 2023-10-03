import React, { FC } from "react";
import { Proposal } from "../utils/types";
import { Box, Flex, Heading, Text } from "@chakra-ui/layout";
import {
  CHAIN_METADATA,
  KNOWN_FORMATS,
  formatDate,
  getFormattedUtcOffset,
  shortenAddress,
} from "../utils/networks";
import { styled } from "styled-components";
import { FormLabel } from "@chakra-ui/form-control";
import BoxWrapper from "./BoxWrapper";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "@ethersproject/units";
import { useNetwork } from "../contexts/network";
// import format from "date-fns/format";
import { format } from "date-fns";
import useIsUserDeposited from "../hooks/useIsUserDeposited";
import { useWallet } from "../hooks/useWallet";
import { Button } from "@chakra-ui/button";
import { Tooltip } from "@chakra-ui/tooltip";
import useIsUserVotedOnProposal from "../hooks/useIsUserVotedOnProposal";
import useFetchVoterDepositAmount from "../hooks/useFetchVoterDepositAmount";
import { useClient } from "../hooks/useClient";
import { DepositSteps } from "@xinfin/osx-daofin-sdk-client";
import { Input, InputGroup, InputRightAddon } from "@chakra-ui/input";
import { useDisclosure } from "@chakra-ui/hooks";
import Modal from "./Modal";
import { useForm } from "react-hook-form";
import Deposits from "./Deposits";

const ProposalWrapper = styled.div.attrs({
  className: "",
})``;

const ActionsWrapper = styled(BoxWrapper).attrs({
  className: "h-fit",
})``;
const DurationWrapper = styled(BoxWrapper).attrs({
  className: "h-fit",
})``;
const DepositStatusWrapper = styled(BoxWrapper).attrs({
  className: "h-fit",
})``;
const InfoWrapper = styled(BoxWrapper).attrs({
  className: "",
})``;
const ProposalDetails: FC<{ proposal: Proposal }> = ({ proposal }) => {
  const {
    actions,
    creator,
    dao,
    endDate,
    executed,
    id,
    metadata,
    pluginProposalId,
    potentiallyExecutable,
    startDate,
  } = proposal;

  const { isOpen, onClose, onOpen } = useDisclosure();
  const { network } = useNetwork();
  const { address: voterAddress } = useWallet();
  const isUserDeposited = useIsUserDeposited(voterAddress ? voterAddress : "");
  const isUserVotedOnProposal = useIsUserVotedOnProposal(
    pluginProposalId,
    voterAddress ? voterAddress : ""
  );
  const voterDepositAmount = useFetchVoterDepositAmount(
    voterAddress ? voterAddress : ""
  );

  const { setValue, getValues, register } = useForm({
    defaultValues: {
      depositAmount: 0,
    },
  });
  const { daofinClient } = useClient();
  const handleDeposit = async () => {
    const { depositAmount } = getValues();
    const parsedAmount = parseEther(String(depositAmount));
    const depositIterator = daofinClient?.methods.deposit(parsedAmount);
    if (!depositIterator) return;
    try {
      for await (const step of depositIterator) {
        switch (step.key) {
          case DepositSteps.DEPOSITING:
            console.log(step.txHash);

            break;
          case DepositSteps.DONE: {
            console.log("DONE", step.key, step.key);
            break;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleOnChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    setValue(name, value);
  };
  return (
    <>
      {proposal && (
        <ProposalWrapper className="grid grid-cols-12  w-100 p-4 gap-4">
          <InfoWrapper className=" col-span-12 md:col-span-8">
            <Flex direction={"column"}>
              <Flex justifyContent={"start"} alignItems={"center"}>
                <Box>
                  <Heading>{metadata.title}</Heading>
                </Box>
              </Flex>

              <Flex
                justifyContent={"space-between"}
                mt={"1.5"}
                alignItems={"center"}
              >
                <Text color={"gray"}>
                  Published By{" "}
                  <Text display={"inline-block"}>
                    {" "}
                    {shortenAddress(creator)}
                  </Text>
                </Text>
              </Flex>
              <Flex
                direction="column"
                justifyContent={"start"}
                alignItems={"start"}
                mt={"2"}
              >
                <Text>
                  <strong>Summary:</strong>
                </Text>
                <Text textAlign={"left"}>{metadata.summary}</Text>
              </Flex>
              <Flex
                direction="column"
                justifyContent={"start"}
                alignItems={"start"}
                mt={"1.5"}
              >
                <Text>
                  <strong>Description:</strong>
                </Text>
                <Text
                  textAlign={"left"}
                  dangerouslySetInnerHTML={{
                    __html: metadata.description,
                  }}
                />
              </Flex>
            </Flex>
          </InfoWrapper>
          <Box className="col-span-12 md:col-span-4">
            {voterAddress ? (
              <>
                <DepositStatusWrapper className="col-span-4 row-span-3 col-start-9 row-start-auto">
                  <Flex direction={"column"}>
                    <Flex justifyContent={"center"} alignItems={"center"}>
                      <Box>
                        <Heading>Voting Eligibility</Heading>
                      </Box>
                    </Flex>
                    <Flex className="mt-4 flex-col justify-start items-start">
                      <Text>
                        <strong>Has Deposit? </strong>
                        {isUserDeposited ? "Yes" : "No"}
                      </Text>
                      <Text>
                        <strong>
                          Has Voted on proposal no. {pluginProposalId}?{" "}
                        </strong>
                        {isUserVotedOnProposal ? "Yes" : "No"}
                      </Text>
                    </Flex>
                    <Flex
                      className="mt-4"
                      justifyContent={"space-around"}
                      alignItems={"center"}
                    >
                    
                      <Tooltip
                        isDisabled={isUserVotedOnProposal}
                        aria-label="A tooltip"
                      >
                        <Button
                          colorScheme="green"
                          isDisabled={isUserVotedOnProposal}
                        >
                          Vote
                        </Button>
                      </Tooltip>
                    </Flex>
                  </Flex>
                </DepositStatusWrapper>
              </>
            ) : (
              <></>
            )}
            <ActionsWrapper className="col-span-4 row-span-3 col-start-9 row-start-auto">
              <Flex direction={"column"}>
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Box>
                    <Heading>Actions</Heading>
                  </Box>
                </Flex>
                <Flex justifyContent={"start"} alignItems={"center"}>
                  {actions.map(({ data, to, value }) => (
                    <BoxWrapper className="w-full">
                      <Text>
                        {`${formatEther(value)} ${
                          CHAIN_METADATA[network].nativeCurrency.symbol
                        }`}{" "}
                        {"->"} {shortenAddress(to)}
                      </Text>
                      <Text color={"red"}>
                        {" "}
                        {data.toString() === "0x" ? (
                          <></>
                        ) : (
                          `${"invalid Action"} ${data.toString()}`
                        )}
                      </Text>
                    </BoxWrapper>
                  ))}
                </Flex>
              </Flex>
            </ActionsWrapper>
            <DurationWrapper className="col-span-4 row-span-3 col-start-9 row-start-auto">
              <Flex direction={"column"}>
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Box>
                    <Heading>Duration</Heading>
                  </Box>
                </Flex>
                <Flex className="flex-col justify-start items-start">
                  <Text>Now: {new Date().toUTCString()}</Text>
                  <Text>Start Date: {new Date(startDate).toUTCString()}</Text>
                  <Text>End Date: {new Date(endDate).toUTCString()}</Text>
                </Flex>
              </Flex>
            </DurationWrapper>
          </Box>
        </ProposalWrapper>
      )}

      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Deposit">
          <Box>
            <FormLabel>Amount</FormLabel>
            <InputGroup className="m-1">
              <Input
                {...register("depositAmount", {
                  valueAsNumber: true,
                })}
                onChange={handleOnChange}
                placeholder="amount"
              />
              <InputRightAddon
                children={CHAIN_METADATA[network].nativeCurrency.symbol}
              />
            </InputGroup>
            <Tooltip isDisabled={isUserDeposited} aria-label="A tooltip">
              <Button
                colorScheme="blue"
                isDisabled={isUserDeposited}
                onClick={handleDeposit}
              >
                Deposit
              </Button>
            </Tooltip>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default ProposalDetails;