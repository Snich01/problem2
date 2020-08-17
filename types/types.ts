export interface serverResponse {
    data: serverData
}

interface serverData {
    id: number,
    message: string,
    result: resultData
}

interface resultData {
    transactions: [transaction]
}

export interface transaction {
    [k: string]: string
}

