import { ConnectButton } from "web3uikit"

export default function Header() {

    return (
        <>
            <nav >

                <h1 > Oddly Enough 1:1 NFT</h1>
                <ConnectButton moralisAuth={false} />
            </nav>
        </>
    );
}

