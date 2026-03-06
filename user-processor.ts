// 📱 SCENARIO: sei uno sviluppatore junior in una startup di social media.
// Il backend ti manda i dati grezzi degli utenti e dei loro post.
// Il tuo compito è pulirli, validarli e produrre un report finale.

// 🧪 VALIDAZIONE DATI ASINCRONI CON TYPESCRIPT
// Obiettivo: Trasformare dati grezzi API in modelli tipizzati sicuri tramite Type Guards e Discriminated Unions.

interface UtenteBase {
    id:number,
    username:string,
    email:string
}
interface UtenteAttivo extends UtenteBase {
    tipo: "Attivo",
    numeroPosts: number,
}
interface UtenteInattivo extends UtenteBase {
    tipo: "Inattivo",
    giorniAssenza: number,
}
type User = UtenteAttivo | UtenteInattivo;

function isStringa(a:unknown): a is string {
    return(typeof a === "string" && a.trim().length > 0)
}
function isNumeri(b:unknown): b is number {
    return(typeof b === "number" && Number.isInteger(b))
}

function isUtente(valore:unknown): valore is User {
    if(typeof valore !== "object" || valore === null) return false;
    const dato = valore as Record <string, unknown>;
    if(typeof dato.tipo !== "string") return false;

    if(
        !isNumeri(dato.id)||
        !isStringa(dato.username)||
        !isStringa(dato.email)
    )
       {
        return false;
       }

        switch(dato.tipo) {
            case "Attivo":
                return(isNumeri(dato.numeroPosts))
            case "Inattivo":
                return(isNumeri(dato.giorniAssenza))
        }
            return false;
}

async function recuperaUtenti(): Promise<User[]> {
    try {
        const risposta = await fetch("https://jsonplaceholder.typicode.com/users")
        if(!risposta.ok) {
            throw new Error(
                "Errore di connessione!"
            )
        }
        const datiGrezzi = await risposta.json()
        if(!Array.isArray(datiGrezzi)) return [];

        return datiGrezzi
        .map((u:any): User => {
            const base = { id: u.id, username: u.username, email: u.email}

            if(u.id % 2 === 0) {
                return {...base, tipo: "Attivo", numeroPosts: u.id * 3}
            } else {
                return {...base, tipo: "Inattivo", giorniAssenza: u.id * 5}
            }
        })
        .filter(isUtente);
    }
    catch(e) {
        console.log(e)
        return [];
    }
}

async function generaReport(): Promise<void> {
    const utenti = await recuperaUtenti();

    const attivi = utenti.filter(u => u.tipo === "Attivo") as UtenteAttivo[];
    const inattivi = utenti.filter(u => u.tipo === "Inattivo") as UtenteInattivo[];

    console.log("Inizio report");

    console.log(`1. Conteggio: ${attivi.length} Attivi, ${inattivi.length} Inattivi`);

    const media = attivi.length > 0
        ? attivi.reduce((s, u) => s + u.numeroPosts, 0) / attivi.length
        : 0;
    console.log(`2. Media Posts Attivi: ${media.toFixed(2)}`);

    console.log("3. Inattivi critici (>30gg):");
    inattivi
        .filter(u => u.giorniAssenza > 30)
        .forEach(u => console.log(` - ${u.username} (${u.email})`));

    console.log("--- FINE REPORT ---");
}


generaReport();
