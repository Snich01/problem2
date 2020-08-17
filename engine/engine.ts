import axios from "axios";
import * as config from "../config.json";
import DBfunctions from "../db/DBfunctions"
import {serverResponse} from "../types/types";

const urlLastBlock = "https://api.etherscan.io/api?module=proxy&action=eth_blockNumber"
const urlNumberBlock = "https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&boolean=true&tag="

const mainProcess = async () => {
    try {
        await DBfunctions.pgMigrations()
        let sqlData = await DBfunctions.selectLastUpdate()
        let firstBlock: number

        if (sqlData.rows[0].max == undefined) {
            firstBlock = config.firstBlock
        } else {
            firstBlock = parseInt(sqlData.rows[0].max, 10)
        }

        let response_data = await axios.get(urlLastBlock)
        let lastBlock: number = (parseInt(response_data.data.result, 16))

        await getInformation(firstBlock, lastBlock)
    } catch (error) {
        console.log(error)
    }
}

const getInformation = async (first: number, last: number) => {

    let currentBlock: number = first
    try {
        do {
            console.log(`fetch from ${currentBlock} block`)
            const data: serverResponse = await axios.get(generateURL(currentBlock.toString(16)))

            if (data.data.message == "NOTOK") {
                console.log("request limit exceeded")
                await sleep(5000)
                continue
            }

            await DBfunctions.pgUpdateData(data.data.result.transactions, currentBlock)
            ++currentBlock
        } while (currentBlock <= last)

    } catch (error) {
        console.log(error)
    }
}

const generateURL = (i: string): string => {
    return `${urlNumberBlock}${i}&apikey=${config.apikey}`
}

const sleep = time =>
    new Promise(
        resolve => setTimeout(_ => resolve(), time)
    );

export default {mainProcess}