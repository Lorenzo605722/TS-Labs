// 🥫 SCENARIO: azienda alimentare
// Ricevi dal backend una lista di prodotti.
// Alcuni sono freschi, altri sono secchi.
// Devi validare i dati e generare un piccolo report.

interface ProdottoBase {
    id: number
    nome: string
    reparto: string
}

interface ProdottoFresco extends ProdottoBase {
    scadenzaGiorni: number
    tipo: "fresco"
}

interface ProdottoSecco extends ProdottoBase {
    pesoGrammi: number
    tipo: "secco"
}

type Prodotti = ProdottoFresco | ProdottoSecco

function ControllaNumero(a: unknown): a is number {
    return typeof a === "number" && Number.isInteger(a)
}

function ControllaStringa(b: unknown): b is string {
    return typeof b === "string" && b.trim().length > 0
}

function RangeDate(c: unknown, min: number, max: number): c is number {
    return typeof c === "number" && c >= min && c <= max
}

const alimenti: Prodotti[] = [
    { id: 1, nome: "Latte", reparto: "Frigo", tipo: "fresco", scadenzaGiorni: 6 },
    { id: 2, nome: "Pasta", reparto: "Dispensa", tipo: "secco", pesoGrammi: 500 },
    { id: 3, nome: "Yogurt", reparto: "Frigo", tipo: "fresco", scadenzaGiorni: 10 },
    { id: 4, nome: "Riso", reparto: "Dispensa", tipo: "secco", pesoGrammi: 1000 },
    { id: 5, nome: "Mozzarella", reparto: "Frigo", tipo: "fresco", scadenzaGiorni: 4 },
    { id: 6, nome: "Farina", reparto: "Dispensa", tipo: "secco", pesoGrammi: 1000 },
]

function isProdotto(valore: unknown): valore is Prodotti {
    if (typeof valore !== "object" || valore === null) return false
    const dato = valore as Record<string, unknown>

    if (
        !ControllaNumero(dato.id) ||
        !ControllaStringa(dato.nome) ||
        !ControllaStringa(dato.reparto) ||
        !ControllaStringa(dato.tipo)
    ) {
        return false
    }

    switch (dato.tipo) {
        case "fresco":
            return RangeDate(dato.scadenzaGiorni, 1, 31)
        case "secco":
            return ControllaNumero(dato.pesoGrammi)
    }

    return false
}

async function recuperaProdotti(): Promise<Prodotti[]> {
    try {
        const risposta = await fetch("https://jsonplaceholder.typicode.com/users")
        if (!risposta.ok) {
            throw new Error("Errore nella connessione al server")
        }

        const datiGrezzi = await risposta.json()
        if (!Array.isArray(datiGrezzi)) return []

        return datiGrezzi
            .map((u: any): Prodotti => {
                const base = { id: u.id, nome: u.name, reparto: u.address.city }

                if (u.id % 2 === 0) {
                    return { ...base, tipo: "fresco", scadenzaGiorni: 10 }
                } else {
                    return { ...base, tipo: "secco", pesoGrammi: 120 }
                }
            })
            .filter(isProdotto)
    } catch (e) {
        console.log(e)
        return []
    }
}

type ApiResponse<T> = {
    success: boolean
    data: T
    message: string
}

function getfirst<T>(items: T[]): T | undefined {
    return items[0]
}

const primoProdotto = getfirst(alimenti)

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
    return items.map(item => item[key])
}

const ProdottiPluck1 = pluck(alimenti, "tipo")
const ProdottiPluck2 = pluck(alimenti, "id")
const ProdottiPluck3 = pluck(alimenti, "reparto")

const rispostaCatalogo: ApiResponse<Prodotti[]> = {
    success: true,
    data: alimenti,
    message: "Catalogo caricato correttamente"
}

const prodottiFreschi = alimenti.filter(
    (p): p is ProdottoFresco => p.tipo === "fresco"
)

const prodottiSecchi = alimenti.filter(
    (p): p is ProdottoSecco => p.tipo === "secco"
)

function reportProdotti(): void {
    console.log("--- REPORT CATALOGO ---")

    console.log(`Totale prodotti: ${alimenti.length}`)
    console.log(`Prodotti freschi: ${prodottiFreschi.length}`)
    console.log(`Prodotti secchi: ${prodottiSecchi.length}`)

    if (prodottiFreschi.length > 0) {
        const sommaScadenze = prodottiFreschi.reduce(
            (acc, p) => acc + p.scadenzaGiorni,
            0
        )
        const mediaScadenze = sommaScadenze / prodottiFreschi.length
        console.log(`Media giorni di scadenza: ${mediaScadenze}`)
    }

    if (prodottiSecchi.length > 0) {
        const pesoMax = prodottiSecchi.reduce((max, p) =>
            p.pesoGrammi > max.pesoGrammi ? p : max
        )
        console.log(`Prodotto secco con peso maggiore: ${pesoMax.nome}`)
    }
}

reportProdotti()
