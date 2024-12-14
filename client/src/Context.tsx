
import { createContext, useContext, useState, ReactNode } from 'react';
import ScoutCard from "./assets/ScoutCard.jpg";
import KnightCard from "./assets/KnightCard.jpg";
import HealerCard from "./assets/HealerCard.jpg";
import MageCard from "./assets/MageCard.jpg";
import TankCard from "./assets/TankCard.jpg";
import Map from "./assets/map.jpeg";
import { Alchemy, Network } from "alchemy-sdk";

export const alchemyClient = new Alchemy({
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network:  Network.SHAPE_MAINNET as Network,
});

const shapeKeyContracAtAddr = "0x05aA491820662b131d285757E5DA4b74BD0F0e5F";

const getNfts = async (address: string) => {
  try {
    const nfts = await alchemyClient.nft.getNftsForOwner(address);
    console.log(nfts);
    return nfts.ownedNfts || [];
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
};


const playerHasShapeKey = async (account: string): Promise<boolean> => {
  const playerNfts = await getNfts(account);
  return playerNfts.some((nft) => nft.contract.address.toLowerCase() === shapeKeyContracAtAddr.toLowerCase());
};


interface ContextProps {
  account: string | null;
  contract: any;
  skinImageMap: { [key: string]: string };
  defaultSkins: { [key: string]: string };
  setAccount: (account: string | null) => void;
  setContract: (contract: any) => void;
  changeToDefault: () => void;
  updateSkinImage: (skinName: string, newImagePath: string) => void;
  shapeKeyPossess: boolean | null;
  checkShapeKey: (user: string) => void;
}

const AppContext = createContext<ContextProps | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const defaultSkins: { [key: string]: string } = {
  ScoutCard:ScoutCard,
  KnightCard:KnightCard,
  HealerCard:HealerCard,
  MageCard:MageCard,
  TankCard:TankCard,
  Map: Map,
};
export let skinImageMap: { [key: string]: string } = {
  ScoutCard:ScoutCard,
  KnightCard:KnightCard,
  HealerCard:HealerCard,
  MageCard:MageCard,
  TankCard:TankCard,
  Map: Map,
};

export const changeToDefault = () =>{
  skinImageMap = defaultSkins;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [shapeKeyPossess, setShapeKeyPossess] = useState<any>(null);

  const updateSkinImage = (skinName: string, newImagePath: string) => {
    if (skinImageMap[skinName]) {
      skinImageMap[skinName] = newImagePath;
    } else {
      console.warn(`Skin name "${skinName}" does not exist in the image map.`);
    }
  };

  const checkShapeKey = async (user: string) =>{
    const possessed = await playerHasShapeKey(user);
    setShapeKeyPossess(possessed);
  }

  return (
    <AppContext.Provider value={{ account, contract, setAccount, setContract, defaultSkins, skinImageMap, updateSkinImage, changeToDefault, checkShapeKey, shapeKeyPossess }}>
      {children}
    </AppContext.Provider>
  );
};
