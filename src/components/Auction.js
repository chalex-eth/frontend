import { contractAddress, abi } from "../constants"
import { useMoralis } from "react-moralis"
import { useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { Information, Widget, Form } from "web3uikit"
import { formatEther } from 'ethers/lib/utils'
import { useNotification } from "web3uikit"

export default function Auction() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const auctionAddress = chainId in contractAddress ? contractAddress[chainId][0] : null

    const [biddingPrice, setBidPrice] = useState("0")
    const [bidder, setBidder] = useState("0")
    const [endAuction, setEndingAuction] = useState("0")
    const dispatch = useNotification()


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
        const endAuctionFromCall = (await getEndingAuction()).toString()
        setBidPrice(formatEther(bidPriceFromCall))
        setBidder(bidderFromCall)
        setEndingAuction(setTime(endAuctionFromCall))
    }

    const setTime = (timestamp) => {
        var tmp = new Date(timestamp * 1000).toLocaleString();
        return tmp;
    }

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

            <Information information={endAuction}
                topic="Auction end" />
            <Information information={bidder}
                topic="Winning bidder" />
            <Information information={biddingPrice + " ETH"}
                topic="Current bid" />


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
            />

        </>
    )
}