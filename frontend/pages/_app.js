import "@/styles/globals.css";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  polygonMumbai,
  bscTestnet,
  baseGoerli,
  avalancheFuji,
  celoAlfajores,
  moonbaseAlpha,
} from "wagmi/chains";

import Layout from "@/components/Layout/Layout";

const chains = [
  polygonMumbai,
  bscTestnet,
  baseGoerli,
  avalancheFuji,
  celoAlfajores,
  moonbaseAlpha,
];
const projectId = "e4c7b443da64b8536ebe63013642fd28";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function App({ Component, pageProps }) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
