// 🌤️ SCENARIO: sei uno sviluppatore junior in una startup meteo.
// Ricevi dal backend una lista di rilevazioni meteorologiche da diverse città.
// Il tuo compito è validarle e generare un report climatico.

interface RilevazioneBase {
    id:number
    citta:string
    nazione:string
}
interface RilevazioneSole extends RilevazioneBase {
    tipo:"Soleggiato"
    temperatura:number
}
interface RilevazioneNeve extends RilevazioneBase {
    tipo:"Nevoso"
    centimetriNeve:number
}
type Rilevazione = RilevazioneSole | RilevazioneNeve

const rilevazioni: Rilevazione[] = [
    { id: 1, citta: "Roma", nazione: "Italia", tipo: "Soleggiato", temperatura: 32 },
    { id: 2, citta: "Oslo", nazione: "Norvegia", tipo: "Nevoso", centimetriNeve: 18 },
    { id: 3, citta: "Madrid", nazione: "Spagna", tipo: "Soleggiato", temperatura: 38 },
    { id: 4, citta: "Helsinki", nazione: "Finlandia", tipo: "Nevoso", centimetriNeve: 25 },
    { id: 5, citta: "Napoli", nazione: "Italia", tipo: "Soleggiato", temperatura: 29 },
    { id: 6, citta: "Stoccolma", nazione: "Svezia", tipo: "Nevoso", centimetriNeve: 12 },
    { id: 7, citta: "Siviglia", nazione: "Spagna", tipo: "Soleggiato", temperatura: 41 },
];

function Stringa (a:unknown): a is string {
    return(typeof a === "string" && a.trim().length > 0)
}
function Numero(n:unknown): n is number {
    return(typeof n === "number" && Number.isInteger(n))
}

function isRilevazione(valore:unknown): valore is Rilevazione {
    if(typeof valore !== "object" || valore === null) return false;
    const dato = valore as Record <string, unknown>;

    if( !Numero(dato.id) ||
        !Stringa(dato.citta) ||
        !Stringa(dato.nazione))
        return false;

        switch(dato.tipo) {
            case "Soleggiato":
                return(
                    Numero(dato.temperatura)
                )
            case "Nevoso":
                return(
                    Numero(dato.centimetriNeve)
                )
        }
        return false;
}

async function recuperaRilevazioni(): Promise<Rilevazione[]> {
    try{
    const risposta = await fetch("https://jsonplaceholder.typicode.com/users")
    if(!risposta.ok){
        throw new Error ("Errore: connessione al server fallita")
    }
    const datiGrezzi = await risposta.json();
    if(!Array.isArray(datiGrezzi)) return [];

    return datiGrezzi
    .map((p:any): Rilevazione => {
        const base = {id: p.id, citta: p.address.city, nazione: p.company.name}
        if(p.id % 2 === 0) {
            return {...base, tipo: "Soleggiato", temperatura: p.id * 3}
        } else {
            return {...base, tipo:"Nevoso", centimetriNeve: p.id *2}
        }})
        .filter(isRilevazione);
    }
    catch(e){
        console.error(e)
        return[];
    }
}

function report(): void {

    console.log("---REPORT METEO---")

    //conteggio rilevazioni soleggiate e nevose
    const contoRilevazioniSole = rilevazioni.filter(g=> g.tipo === "Soleggiato").length;
    console.log(`Rilevazioni Solari effettuate: ${contoRilevazioniSole}`)
    const contoRilevazioniNeve = rilevazioni.filter(g=> g.tipo === "Nevoso").length;
    console.log(`Rilevazioni Nevoso effettuate: ${contoRilevazioniNeve}`)


    //media temperatura soleggiata
    if(contoRilevazioniSole > 0) {
    const filtroSole = rilevazioni.filter(s=> s.tipo === "Soleggiato") as RilevazioneSole[]
    const sommaSole = filtroSole.reduce((sole, h) => sole + h.temperatura,0);
    const media = sommaSole/filtroSole.length
    console.log(media);
    //città con la temperatura più alta
    const temperaturaAlta = filtroSole.reduce((max, k) =>
        k.temperatura > max.temperatura ? k:max )
    console.log(temperaturaAlta);
} else { console.log("Nessun dato solare disponibile per la media!")}

    if(contoRilevazioniNeve > 0) {
    //città con temperatura più bassa
    const filtroSole = rilevazioni.filter(s=> s.tipo === "Soleggiato") as RilevazioneSole[]
    const temperaturaBassa = filtroSole.reduce((min,k) =>
        k.temperatura < min.temperatura ? k:min)
    console.log(temperaturaBassa);

    // lista di tutte le città nevose
    const filtroNeve = rilevazioni.filter(a=> a.tipo === "Nevoso") as RilevazioneNeve[]
    filtroNeve.forEach(w=> 
    console.log(`Città: ${w.citta} Centimetri di neve: ${w.centimetriNeve}`))
    }
}

report();
