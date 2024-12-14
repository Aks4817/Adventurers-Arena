import { useState, useEffect } from 'react';
import BuyCard from './components/BuyCard';
import DisplayCard from "./components/DisplayCard";
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './Context';
import k2 from './assets/k2.jpg';
import map2 from './assets/map2.jpeg';
import SkinsBg from "./assets/skins.jpeg";

interface Item {
  id: number;
  price: number;
  name: string;
}

const buyableSkins: { [key: string]: { image: string; title: string; category: string } } = {
  k2: { image: k2, title: 'Knight of Valor', category: "KnightCard" },
};
const collabSkins: { [key: string]: { image: string; title: string; category: string } } = {
  map2: { image: map2, title: 'Depth of Fire', category: "Map" },
  k2: { image: k2, title: 'Knight of Valor', category: "KnightCard" },
};

const Skins: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [boughtItems, setBoughtItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { account, contract, skinImageMap, updateSkinImage, shapeKeyPossess } = useAppContext();
  const [currentSkins, setCurrentSkins] = useState<{ [key: string]: string }>({});
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'current' | 'available' | 'collab' | 'make'>('current');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchItems = async () => {
      if (!account || !contract) return;
      try {
        setLoading(true);
        const rawItems: any[] = await contract.getItemsDetails();
        const allItems = rawItems.map((item: any, index: number) => ({
          id: index,
          price: Number(item[0]),
          name: String(item[1]),
        }));
        const userBoughtItems: any[] = await contract.getItemsIdBoughtByUser(account);
        const boughtSet = new Set(userBoughtItems.map((id) => Number(id)));    
        setItems(allItems);
        setBoughtItems(boughtSet);

      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchItems();
  }, [account, contract]);

  useEffect(() => {
    setCurrentSkins(skinImageMap);
  }, [skinImageMap]);

  const handleBuy = async (id: number, price: number) => {
    if (!contract) return;

    try {
      const bigIntPrice = BigInt(price);
      const tx = await contract.buyItem(id, { value: bigIntPrice });
      await tx.wait();

      setBoughtItems((prev) => {
        const updatedSet = new Set(prev);
        updatedSet.add(id);
        return updatedSet;
      });
    } catch (error) {
      console.error("Error buying item:", error);
    }
  };

  const chooseBoughtSkin = (name: string, imgLoc: string) => {
    const category = buyableSkins[name].category;
    updateSkinImage(category, imgLoc);

    setCurrentSkins((prev) => ({
      ...prev,
      [category]: imgLoc,
    }));
    setSelectionMessage("Skin selected!");
    setTimeout(() => setSelectionMessage(null), 1500);
  };
  const chooseCollabSkin = (name: string, imgLoc: string) => {
    const category = collabSkins[name].category;
    updateSkinImage(category, imgLoc);
    
    setCurrentSkins((prev) => ({
      ...prev,
      [category]: imgLoc,
    }));
    setSelectionMessage("Skin selected!");
    setTimeout(() => setSelectionMessage(null), 1500);
  };

  const goLobby = () => {
    navigate('/');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'current':
        return (
          <section className="current-skins">
            <h2 className="medievalsharp-regular skin-subtitle">Current Skins</h2>
            <div className="skin-cardContainer">
              {Object.entries(currentSkins).map(([key, value]) => (
                <DisplayCard
                  key={key}
                  image={value}
                  title={key.replace("Card", "")}
                />
              ))}
            </div>
          </section>
        );
      case 'available':
        return (
          <section className="all-skins">
            <h2 className="medievalsharp-regular skin-subtitle">Available Skins</h2>
            {selectionMessage && <h3 className="skin-selection-message medievalsharp-regular">{selectionMessage}</h3>}
            <div className="skin-cardContainer">
              {Object.entries(buyableSkins).map(([key, { image, title }]) => {
                const item = items.find((i) => i.name === key);
                const isBought = item ? boughtItems.has(item.id) : false;

                if (item) {
                  return (
                    <BuyCard
                      key={item.id}
                      image={image}
                      title={title}
                      onAction={() =>
                        isBought
                          ? chooseBoughtSkin(key, image)
                          : handleBuy(item.id, item.price)
                      }
                      buttonText={isBought ? "Select" : `Buy ${item.price}`}
                    />
                  );
                }
                return null;
              })}
            </div>
          </section>
        );
      case 'collab':
        return (
          <section className="collab-skins">
            <h2 className="medievalsharp-regular skin-subtitle">Collab Skins</h2>
            {selectionMessage && <h3 className="skin-selection-message medievalsharp-regular">{selectionMessage}</h3>}
            <div className="skin-cardContainer">
            <BuyCard
                      key={"map2"}
                      image={collabSkins["map2"].image}
                      title={"Depth of Fire"}
                      onAction={() =>
                        shapeKeyPossess
                        ? chooseCollabSkin("map2", collabSkins["map2"].image)
                        : null
                      }
                      buttonText={shapeKeyPossess ? "Select" : `From Shape Keys`}
                      />
          </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="skin-container"  style={{
      backgroundImage: `url(${SkinsBg})`}}>
      <button className="skin-backButton merienda-regular" onClick={goLobby}>
        Back
      </button>
  
      {(!account || !contract) ? (
        <h1 className="skin-error merienda-regular">Please connect wallet first!</h1>
      ) : loading ? (
        <h1 className="skin-loading merienda-regular">Loading items...</h1>
      ) : (
        <>
          <header className="skin-header">
            <h1 className="skin-title medievalsharp-bold">Skin Selection</h1>
          </header>

          <div className="skin-navButtons">
            <button onClick={() => setActiveSection('current')} className="skin-navButton merienda-regular">Current Skins</button>
            <button onClick={() => setActiveSection('available')} className="skin-navButton merienda-regular">Available Skins</button>
            <button onClick={() => setActiveSection('collab')} className="skin-navButton merienda-regular">Collab Skins</button>
          </div>
          {renderSection()}
        </>
      )}
    </div>
  );
};  

export default Skins;
