import {Pool} from "pg"
import {createDb, migrate} from "postgres-migrations"
import * as dbconfig from "../dbconfig.json";

const lastUpdateSql = "SELECT MAX(last_update) FROM users"
const maxValueSql = "SELECT user_code FROM users WHERE abs(eth_change)=(select max(abs(eth_change)) FROM users)"

const clientPool = new Pool(dbconfig)

const selectLastUpdate = async () => {
    try {
        let max = await clientPool.query(lastUpdateSql)

        return max
    } catch (error) {
        console.log(error)
        throw error
    }
}


const pgUpdateData = async (data: any, block: number) => {

    try {
        await clientPool.query('BEGIN')
        for (const transaction of data) {
            let transactionTo: string = transaction.to
            let transactionFrom: string = transaction.from

            let value = parseInt(transaction.value, 16)

            if (transactionFrom !== null) {
                let queryFrom = makeInsertSql(transactionFrom, -value, block)


                await clientPool.query(queryFrom)
            } else {
                console.log("bad information about from address", block)
            }
            if (transactionTo !== null) {
                let queryTo = makeInsertSql(transactionTo, value, block)

                await clientPool.query(queryTo)
            } else {
                console.log("bad information about to address", block)
            }
        }
        await clientPool.query('COMMIT')

    } catch (error) {
        await clientPool.query('ROLLBACK')
        console.log(error)
        throw error
    }
}

const pgMigrations = async () => {

    await createDb("Problem2", {
        ...dbconfig,
        defaultDatabase: "postgres",
    })
    await migrate(dbconfig, "./migrations")
}


const makeInsertSql = (address: string, value: number, block: number) => {
    return {
        text: `INSERT INTO users (user_code, eth_change, last_update) VALUES ($1, $2, $3)
        ON CONFLICT (user_code) DO UPDATE SET eth_change=users.eth_change+$4, last_update=$5;`,
        values: [address, value, block, value, block]
    }

}

export const findMaxValue = async () => {
    try {

        let max = await clientPool.query(maxValueSql)

        return max
    } catch (error) {
        console.log(error)

    }
}


export default {pgMigrations, pgUpdateData, selectLastUpdate, findMaxValue}