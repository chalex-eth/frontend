import { contractAddress, abi } from "../constants"
import { useMoralis } from "react-moralis"
import { useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { Information, Form } from "web3uikit"
import { formatEther } from 'ethers/lib/utils'
import { useNotification } from "web3uikit"

export default function Auction() {

    const startAuction = 1650454861;
    const endAuction = 1651318861;
    const { Moralis, isWeb3Enabled, chainId: chainIdHex, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const auctionAddress = chainId in contractAddress ? contractAddress[chainId][0] : null

    const [biddingPrice, setBidPrice] = useState("0")
    const [bidder, setBidder] = useState("0")
    const [timeLeft, setTimeLeft] = useState("0");
    const dispatch = useNotification()

    const shortenAddress = (addr) => `${addr.slice(0, 5)}...${addr.slice(-4)}`;

    const { runContractFunction: getbidPrice } = useWeb3Contract({
        abi: abi,
        contractAddress: auctionAddress, // specify the networkId
        functionName: "bidPrice",
        params: {},
    })

    const { runContractFunction: getBidder } = useWeb3Contract({
        abi: abi,
        contractAddress: auctionAddress, // specify the networkId
        functionName: "bidder",
        params: {},
    })

    const { runContractFunction: getEndingAuction } = useWeb3Contract({
        abi: abi,
        contractAddress: auctionAddress, // specify the networkId
        functionName: "endAuction",
        params: {},
    })


    async function updateUIValues() {
        const bidPriceFromCall = (await getbidPrice()).toString()
        const bidderFromCall = await getBidder()
        setBidPrice(formatEther(bidPriceFromCall))
        setBidder(bidderFromCall)
    }


    const setTime = () => {
        var now = Math.floor(Date.now() / 1000);
        var diff = Number(endAuction) - Number(now);
        var h = Math.floor(diff % (3600 * 24) / 3600);
        var m = Math.floor(diff % 3600 / 60);
        var s = Math.floor(diff % 60);
        var timer = String();
        timer = h + "h      " + m + "m      " + s + "s";
        setTimeLeft(timer);
    }

    useEffect(() => {
        const interval = setInterval(() => {

            setTime();
        }, 1000);
        return () => clearInterval(interval);

    }, []);


    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    async function setBidTx(e) {
        var bidVal = e.data[0].inputResult;
        var minBid = Number(biddingPrice) + Number(0.0200);
        minBid = Math.round(minBid * 100) / 100;
        const options = {
            contractAddress: auctionAddress,
            functionName: "setBid",
            abi: abi,
            msgValue: Moralis.Units.ETH(bidVal),
        };
        if (bidVal >= minBid) {
            const transaction = await Moralis.executeFunction(options);
            const receipt = await transaction.wait(1);
            handleTx();
        }
        else { handleBidTooLow() }
    }


    const handleBidTooLow = () => {
        dispatch({
            type: "error",
            message: "You need to increase your bid",
            title: "Bid too low",
            position: "topR",
            icon: "info"

        })
    }

    const handleTx = () => {
        dispatch({
            type: "success",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR"
        })
    }

    return (
        <>
            <h1 > Oddly Enough 1:1 NFT</h1>
            <p>Ali Chaaban X YKONE</p>
            <h4>Current bid</h4>
            <h3>{"ETH " + biddingPrice}</h3>

            <h4>Auctions ends in</h4>
            <h3>{timeLeft}</h3>

            {account ? (
                <Form
                    buttonConfig={{
                        onClick: function noRefCheck() { },
                        theme: 'primary'
                    }}
                    data={[
                        {
                            inputWidth: '10%',
                            name: 'Your bid',
                            type: 'number',
                            value: ""
                        }
                    ]}
                    onSubmit={async (e) => await setBidTx(e)}
                    title="Place a bid"
                />) : (<h2> Please connect wallet</h2>)}

            <h4>Winning bidder</h4>
            <h3>{shortenAddress(bidder)}</h3>

            <form onSubmit={async (e) => await setBidTx(e)}>
                <label>
                    Place a bid :
                    <input type="number" name="name" />
                </label>
                <input type="submit" value="Bid" />
            </form>




        </>
    )
}
