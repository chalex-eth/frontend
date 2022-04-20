import { ConnectButton } from "web3uikit"

export default function Header() {

    return (
        <>
            <nav >
                <h1 > Oddly Enough NFT 1:1 auction</h1>
                <div >
                    <ConnectButton moralisAuth={false} />
                </div>
            </nav>
        </>
    );
}

